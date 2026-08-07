from app.services.chat.query_router import QueryRouter


def test_metadata_queries_are_classified_as_metadata():
    router = QueryRouter()

    assert router.classify("How many documents are uploaded?") == "metadata"
    assert router.classify("List the uploaded documents") == "metadata"
    assert router.classify("Show corpus statistics") == "metadata"


def test_general_conversation_is_classified_as_general():
    router = QueryRouter()

    assert router.classify("Hello there") == "general"
    assert router.classify("Thanks for the help") == "general"


def test_document_questions_default_to_rag():
    router = QueryRouter()

    assert router.classify("What does the document say about project scope?") == "rag"
