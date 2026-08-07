import re


class QueryRouter:
    """
    Classifies a user query into one of three intents:
    metadata, rag, or general.
    """

    _METADATA_PATTERNS = (
        "how many documents",
        "uploaded documents",
        "list uploaded",
        "document count",
        "documents uploaded",
        "corpus statistics",
        "corpus",
        "total chunks",
        "chunk count",
        "total corpus size",
        "largest document",
        "smallest document",
        "upload date",
        "upload dates",
        "uploaded at",
        "index status",
        "indexed",
        "metadata",
        "statistics",
    )

    _GENERAL_PATTERNS = (
        "hello",
        "hi",
        "hey",
        "thanks",
        "thank you",
        "good morning",
        "good evening",
        "how are you",
        "who are you",
        "what is your name",
        "tell me a joke",
        "bye",
        "goodbye",
        "can you help",
        "can you assist",
    )

    def classify(self, query: str) -> str:
        """
        Return the highest-confidence intent for the supplied query.
        """

        normalized = re.sub(r"\s+", " ", query or "").strip().lower()

        if not normalized:
            return "general"

        # Remove punctuation to ensure clean word boundary matching
        clean_query = re.sub(r"[^\w\s]", "", normalized)

        # Match metadata patterns with word boundaries
        metadata_pattern = r"\b(" + "|".join(re.escape(p) for p in self._METADATA_PATTERNS) + r")\b"
        if re.search(metadata_pattern, clean_query):
            return "metadata"

        # Match general patterns with word boundaries
        general_pattern = r"\b(" + "|".join(re.escape(p) for p in self._GENERAL_PATTERNS) + r")\b"
        if re.search(general_pattern, clean_query):
            return "general"

        return "rag"
