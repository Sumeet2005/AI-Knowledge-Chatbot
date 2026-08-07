from google import genai

from app.ai.llm.prompts import SYSTEM_PROMPT
from app.config import settings


class GeminiService:
    """
    Handles communication with Google Gemini
    using the official google-genai SDK.
    """

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GOOGLE_API_KEY
        )

    def generate_answer(
        self,
        question: str,
        context: str,
    ) -> str:
        """
        Generate an answer using the retrieved context.
        """

        prompt = f"""
{SYSTEM_PROMPT}

==============================

Context

{context}

==============================

Question

{question}
"""

        # ---------------- DEBUG ----------------
        print("=" * 70)
        print("GOOGLE_API_KEY:", settings.GOOGLE_API_KEY[:20] + "...")
        print("MODEL:", settings.GEMINI_MODEL)
        print("=" * 70)
        # ---------------------------------------

        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )

        if response.text:
            return response.text

        return "No response was generated."