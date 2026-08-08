import httpx
import time

from app.ai.llm.provider_base import BaseLLMProvider
from app.config import settings, record_stage
from app.exceptions import (
    GeminiQuotaExceeded,
    GeminiUnavailable,
    GeminiTimeout,
    GeminiInternalError,
)


class GroqProvider(BaseLLMProvider):
    """
    Groq API LLM Provider using standard HTTP requests.
    """

    def __init__(self, temperature: float = 0.0, max_tokens: int = 512, top_p: float = 1.0):
        self.api_key = settings.GROQ_API_KEY
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

        # Read model from .env instead of hardcoding
        self.model = settings.GROQ_MODEL
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.top_p = top_p

    def _call_api(self, prompt: str) -> str:
        if not self.api_key:
            raise GeminiInternalError("Groq API key is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "top_p": self.top_p,
        }

        try:
            t0 = time.perf_counter()

            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                )

            record_stage(
                "groq_api_call",
                (time.perf_counter() - t0) * 1000.0,
            )

            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]

            elif response.status_code == 429:
                raise GeminiQuotaExceeded(
                    f"Groq quota exceeded: {response.text}"
                )

            elif response.status_code in (500, 502, 503, 504):
                raise GeminiUnavailable(
                    f"Groq service unavailable: {response.text}"
                )

            else:
                raise GeminiInternalError(
                    f"Groq API error ({response.status_code}): {response.text}"
                )

        except httpx.TimeoutException as e:
            raise GeminiTimeout(
                f"Groq API request timed out: {e}"
            )

        except httpx.RequestError as e:
            raise GeminiUnavailable(
                f"Groq network connection failed: {e}"
            )

        except (
            GeminiQuotaExceeded,
            GeminiUnavailable,
            GeminiTimeout,
            GeminiInternalError,
        ):
            raise

        except Exception as e:
            raise GeminiInternalError(
                f"Unexpected Groq failure: {e}"
            )

    def generate_answer(self, question: str, context: str) -> str:
        from app.ai.llm.prompts import SYSTEM_PROMPT

        prompt = f"""{SYSTEM_PROMPT}

Context:
{context}

Question:
{question}
"""

        return self._call_api(prompt)

    def rewrite_query(self, query: str, history: str) -> str:
        prompt = f"""You are an assistant that rewrites search queries.

Given the conversation history and the latest user query, determine if the latest user query is ambiguous, conversational, or references context from previous messages.

If it is dependent on history, rewrite it into a clear, standalone search query that preserves the user's intent and contains all necessary keywords for a retrieval system.

If it is already a standalone query or doesn't need context from history, return the original query exactly as-is.

Do not include explanations, markdown, or quotes.

Conversation History:
{history}

Latest User Query:
{query}

Standalone Query:
"""

        return self._call_api(prompt).strip('"` ')