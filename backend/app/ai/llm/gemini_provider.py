import time
from google import genai
from google.genai.errors import APIError
from app.ai.llm.provider_base import BaseLLMProvider
from app.ai.llm.prompts import SYSTEM_PROMPT
from app.config import settings, record_stage
from app.exceptions import GeminiQuotaExceeded, GeminiUnavailable, GeminiTimeout, GeminiInternalError

class GeminiProvider(BaseLLMProvider):
    """
    Google Gemini API LLM Provider.
    """

    def __init__(self, temperature: float = 0.0, max_tokens: int = 512, top_p: float = 1.0):
        self.client = genai.Client(
            api_key=settings.GOOGLE_API_KEY
        )
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.top_p = top_p

    def generate_answer(
        self,
        question: str,
        context: str,
    ) -> str:
        """
        Generate an answer using the retrieved context.
        """
        import time
        from app.config import record_stage

        t_prompt_start = time.perf_counter()
        prompt = f"""
{SYSTEM_PROMPT}

==============================

Context

{context}

==============================

Question

{question}
"""
        record_stage("prompt_construction", (time.perf_counter() - t_prompt_start) * 1000.0)

        # ---------------- DEBUG ----------------
        print("=" * 70)
        print("GOOGLE_API_KEY:", settings.GOOGLE_API_KEY[:20] + "...")
        print("MODEL:", settings.GEMINI_MODEL)
        print("=" * 70)
        # ---------------------------------------

        # Simulation hooks for verification
        import os
        sim_error = os.environ.get("SIMULATE_GEMINI_ERROR")
        max_attempts = 3
        backoff_delays = [1.0, 2.0, 4.0]
        res_text = None

        for attempt in range(1, max_attempts + 1):
            try:
                if sim_error:
                    if sim_error == "503":
                        from google.genai.errors import ServerError
                        raise ServerError(503, {"error": "Simulated 503 Service Unavailable"})
                    elif sim_error == "429":
                        from google.genai.errors import ClientError
                        raise ClientError(429, {"error": "Simulated 429 RESOURCE_EXHAUSTED"})
                    elif sim_error == "timeout":
                        raise TimeoutError("Simulated connection timeout")

                t_api_start = time.perf_counter()
                from google.genai import types
                config = types.GenerateContentConfig(
                    temperature=self.temperature,
                    top_p=self.top_p,
                    max_output_tokens=self.max_tokens,
                )
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=config,
                )
                record_stage("gemini_api_call", (time.perf_counter() - t_api_start) * 1000.0)

                t_parse_start = time.perf_counter()
                res_text = response.text
                record_stage("response_parsing", (time.perf_counter() - t_parse_start) * 1000.0)
                break
            except APIError as e:
                code = getattr(e, "code", None)
                if code == 429:
                    raise GeminiQuotaExceeded(f"Gemini API quota exceeded: {e}")
                elif code == 503:
                    if attempt < max_attempts:
                        delay = backoff_delays[attempt - 1]
                        from app.config import logger
                        logger.warning(f"Gemini ServerError (503) on attempt {attempt}/{max_attempts}. Retrying in {delay}s...")
                        time.sleep(delay)
                    else:
                        raise GeminiUnavailable(f"Gemini service unavailable after {max_attempts} attempts: {e}")
                elif code == 408:
                    raise GeminiTimeout(f"Gemini request timed out: {e}")
                else:
                    raise GeminiInternalError(f"Gemini API error ({code}): {e}")
            except (TimeoutError, ConnectionError) as e:
                raise GeminiTimeout(f"Gemini request timed out: {e}")
            except Exception as e:
                err_name = type(e).__name__
                if "Timeout" in err_name:
                    raise GeminiTimeout(f"Gemini request timed out: {e}")
                raise GeminiInternalError(f"Unexpected Gemini API error: {e}")

        if res_text:
            return res_text

        return "No response was generated."

    def rewrite_query(self, query: str, history: str) -> str:
        """
        Rewrite query into a standalone query if needed using Gemini.
        """
        prompt = f"""You are an assistant that rewrites search queries.
Given the conversation history and the latest user query, determine if the latest user query is ambiguous, conversational, or references context from previous messages.
If it is dependent on history, rewrite it into a clear, standalone search query that preserves the user's intent and contains all necessary keywords for a retrieval system.
If it is already a standalone query or doesn't need context from history, return the original query exactly as-is.

Do not include any introductory remarks, explanations, quotes, or markdown. Output ONLY the final query.

Conversation History:
{history}

Latest User Query:
{query}

Standalone Query:"""

        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                temperature=self.temperature,
                top_p=self.top_p,
                max_output_tokens=self.max_tokens,
            )
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=config,
            )
            rewritten = response.text.strip() if response.text else query
            rewritten = rewritten.strip('"`\'')
            return rewritten
        except Exception as e:
            from app.config import logger
            logger.warning(f"Query rewriting failed: {e}")
            return query
