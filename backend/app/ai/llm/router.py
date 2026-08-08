from app.exceptions import GeminiQuotaExceeded, GeminiUnavailable, GeminiTimeout, GeminiException
from app.config import settings, logger
import time
from app.config import record_stage
from sqlalchemy.orm import Session

class LLMRouter:
    """
    LLM Provider Router with automatic fallback support.
    Tries Gemini, then Groq, then Ollama.
    """

    def __init__(self, db: Session | None = None):
        self.db = db

    def _get_providers_order(self) -> list[str]:
        from app.config import get_db_settings
        db_settings = get_db_settings(self.db)
        ai_settings = db_settings.get("ai", {})
        selected_provider = ai_settings.get("provider", "Gemini")
        
        # Normalize provider name to match ("Gemini", "Groq", "Ollama")
        normalized_map = {
            "gemini": "Gemini",
            "groq": "Groq",
            "ollama": "Ollama"
        }
        selected_provider = normalized_map.get(selected_provider.lower(), "Gemini")
        
        providers_order = ["Gemini", "Groq", "Ollama"]
        if selected_provider in providers_order:
            providers_order.remove(selected_provider)
            providers_order.insert(0, selected_provider)
            
        return providers_order

    def _get_provider(self, name: str):
        """
        Dynamically load and instantiate LLM providers checking credentials first.
        Never instantiates a provider unless it will actually be used.
        """
        try:
            from app.config import get_db_settings
            db_settings = get_db_settings(self.db)
            ai_settings = db_settings.get("ai", {})
            
            temperature = ai_settings.get("temperature", 0.0)
            max_tokens = ai_settings.get("max_tokens", 512)
            top_p = ai_settings.get("top_p", 1.0)

            if name == "Gemini":
                if not getattr(settings, "GOOGLE_API_KEY", None):
                    logger.info("Skipping Gemini provider (GOOGLE_API_KEY not configured)")
                    return None
                from app.ai.llm.gemini_provider import GeminiProvider
                try:
                    return GeminiProvider(temperature=temperature, max_tokens=max_tokens, top_p=top_p)
                except Exception as e:
                    logger.exception("Failed to initialize GeminiProvider: %s", e)
                    return None

            elif name == "Groq":
                if not getattr(settings, "GROQ_API_KEY", None):
                    logger.info("Skipping Groq provider (GROQ_API_KEY not configured)")
                    return None
                from app.ai.llm.groq_provider import GroqProvider
                try:
                    return GroqProvider(temperature=temperature, max_tokens=max_tokens, top_p=top_p)
                except Exception as e:
                    logger.exception("Failed to initialize GroqProvider: %s", e)
                    return None

            elif name == "Ollama":
                ollama_url = getattr(settings, "OLLAMA_API_URL", None)
                if not ollama_url:
                    logger.info("Skipping Ollama provider (OLLAMA_API_URL not configured)")
                    return None

                # Quick availability check for Ollama service; do not raise on failure
                try:
                    import httpx

                    try:
                        with httpx.Client(timeout=1.0) as client:
                            resp = client.get(ollama_url)
                            if resp.status_code >= 400:
                                logger.info(
                                    "Skipping Ollama provider (service at %s returned %s)",
                                    ollama_url,
                                    resp.status_code,
                                )
                                return None
                    except Exception:
                        logger.info("Skipping Ollama provider (unable to reach %s)", ollama_url)
                        return None
                except Exception:
                    # If httpx is not installed or another import error occurs, skip Ollama gracefully
                    logger.info("Skipping Ollama provider (httpx unavailable for availability check)")
                    return None

                from app.ai.llm.ollama_provider import OllamaProvider
                try:
                    return OllamaProvider(temperature=temperature, max_tokens=max_tokens, top_p=top_p)
                except Exception as e:
                    logger.exception("Failed to initialize OllamaProvider: %s", e)
                    return None

        except Exception as e:
            # Defensive catch-all: provider resolution must never crash
            logger.exception("Unexpected error while resolving provider %s: %s", name, e)
            return None

        return None

    def generate_answer(self, question: str, context: str) -> str:
        last_error = None
        for name in self._get_providers_order():
            try:
                provider = self._get_provider(name)
                if provider is None:
                    continue
                logger.info(f"Routing generate_answer request to provider: {name}")

                t0 = time.perf_counter()
                try:
                    result = provider.generate_answer(question, context)
                finally:
                    # Record LLM provider execution time regardless of provider or outcome
                    record_stage("llm_api_call", (time.perf_counter() - t0) * 1000.0)

                logger.info(f"Provider {name} successfully served the generate_answer response.")
                return result
            except (GeminiQuotaExceeded, GeminiUnavailable, GeminiTimeout) as e:
                logger.warning(f"Provider {name} failed: {e}. Attempting fallback...")
                last_error = e
            except Exception as e:
                logger.error(f"Provider {name} failed with unexpected error: {e}. Attempting fallback...")
                last_error = e

        if last_error:
            raise last_error
        raise GeminiUnavailable("All LLM providers failed to generate answer.")

    def rewrite_query(self, query: str, history: str) -> str:
        last_error = None
        for name in self._get_providers_order():
            try:
                provider = self._get_provider(name)
                if provider is None:
                    continue
                logger.info(f"Routing rewrite_query request to provider: {name}")

                t0 = time.perf_counter()
                try:
                    result = provider.rewrite_query(query, history)
                finally:
                    record_stage("llm_api_call", (time.perf_counter() - t0) * 1000.0)

                logger.info(f"Provider {name} successfully served the rewrite_query response.")
                return result
            except (GeminiQuotaExceeded, GeminiUnavailable, GeminiTimeout) as e:
                logger.warning(f"Provider {name} failed to rewrite: {e}. Attempting fallback...")
                last_error = e
            except Exception as e:
                logger.error(f"Provider {name} failed to rewrite with unexpected error: {e}. Attempting fallback...")
                last_error = e

        if last_error:
            raise last_error
        raise GeminiUnavailable("All LLM providers failed to rewrite query.")
