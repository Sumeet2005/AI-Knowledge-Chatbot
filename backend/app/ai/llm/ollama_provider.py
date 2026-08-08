import httpx
import time
from app.ai.llm.provider_base import BaseLLMProvider
from app.config import settings, record_stage
from app.exceptions import GeminiQuotaExceeded, GeminiUnavailable, GeminiTimeout, GeminiInternalError

class OllamaProvider(BaseLLMProvider):
    """
    Local Ollama API LLM Provider.
    """

    def __init__(self, temperature: float = 0.0, max_tokens: int = 512, top_p: float = 1.0):
        self.api_url = f"{settings.OLLAMA_API_URL}/api/chat"
        self.model = "llama3"
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.top_p = top_p

    def _call_api(self, prompt: str) -> str:
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "top_p": self.top_p,
                "num_predict": self.max_tokens,
            }
        }

        try:
            t0 = time.perf_counter()
            with httpx.Client(timeout=15.0) as client:
                response = client.post(self.api_url, json=payload, headers=headers)
                
            record_stage("gemini_api_call", (time.perf_counter() - t0) * 1000.0)

            if response.status_code == 200:
                data = response.json()
                return data["message"]["content"]
            elif response.status_code in (502, 503, 504):
                raise GeminiUnavailable(f"Ollama service unavailable: {response.text}")
            else:
                raise GeminiInternalError(f"Ollama API error ({response.status_code}): {response.text}")

        except httpx.TimeoutException as e:
            raise GeminiTimeout(f"Ollama request timed out: {e}")
        except httpx.RequestError as e:
            raise GeminiUnavailable(f"Ollama local connection failed: {e}")
        except Exception as e:
            raise GeminiInternalError(f"Unexpected Ollama failure: {e}")

    def generate_answer(self, question: str, context: str) -> str:
        from app.ai.llm.prompts import SYSTEM_PROMPT
        prompt = f"{SYSTEM_PROMPT}\n\nContext:\n{context}\n\nQuestion:\n{question}"
        return self._call_api(prompt)

    def rewrite_query(self, query: str, history: str) -> str:
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
        return self._call_api(prompt).strip('"`\'')
