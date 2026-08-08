from abc import ABC, abstractmethod

class BaseLLMProvider(ABC):
    """
    Base Interface for all LLM Providers.
    """

    @abstractmethod
    def generate_answer(self, question: str, context: str) -> str:
        """Generate answer based on question and context."""
        pass

    @abstractmethod
    def rewrite_query(self, query: str, history: str) -> str:
        """Rewrite ambiguous query based on conversational history."""
        pass
