import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from langchain_core.documents import Document as LangChainDocument

from app.models import Document, Settings
from app.services.orchestrator import ConversationOrchestratorService
from app.ai.llm.router import LLMRouter
from app.ai.retrieval.retriever_service import RetrieverService
from app.services.indexing_service import IndexingService
from app.monitoring.metrics import MetricsCollector
from app.api.settings import DEFAULTS


# --- Helper to create a mock db session with custom settings ---
def create_mock_db(settings_data=None):
    db = MagicMock(spec=Session)
    mock_settings_obj = MagicMock()
    mock_settings_obj.data = settings_data or {}
    
    # Mock settings query chain
    mock_query = MagicMock()
    mock_query.order_by.return_value.first.return_value = mock_settings_obj
    db.query.return_value = mock_query
    return db


# --- 1. Remove duplicate assistant-message persistence in ConversationOrchestratorService.chat ---
def test_assistant_message_saved_exactly_once():
    db = MagicMock(spec=Session)
    orchestrator = ConversationOrchestratorService(db)
    
    # Mock dependencies
    mock_conv = MagicMock()
    mock_conv.id = 42
    orchestrator.conversation_service.create_conversation = MagicMock(return_value=mock_conv)
    orchestrator.conversation_service.get_messages = MagicMock(return_value=[])
    orchestrator.conversation_service.save_user_message = MagicMock()
    orchestrator.conversation_service.save_assistant_message = MagicMock()
    
    mock_chat_response = MagicMock()
    mock_chat_response.answer = "Test answer"
    mock_chat_response.sources = []
    mock_chat_response.retrieved_chunks = 0
    orchestrator.chat_service.chat = MagicMock(return_value=mock_chat_response)
    
    # Run chat workflow
    response = orchestrator.chat("hello")
    
    assert response.answer == "Test answer"
    # Verify save_assistant_message was called exactly once
    orchestrator.conversation_service.save_assistant_message.assert_called_once_with(42, "Test answer")


# --- 2. Integrate Settings into LLM ---
def test_llm_settings_integration():
    # Test selected provider controls priority
    custom_settings = {
        "ai": {
            "provider": "Groq",
            "temperature": 0.7,
            "max_tokens": 128,
            "top_p": 0.9,
            "streaming": False,
        }
    }
    db = create_mock_db(custom_settings)
    router = LLMRouter(db)
    
    # Order should be Groq first, then Gemini, then Ollama (retaining Gemini -> Ollama relative fallback order)
    assert router._get_providers_order() == ["Groq", "Gemini", "Ollama"]
    
    # Verify parameters are passed to providers
    with patch("app.ai.llm.router.settings") as mock_settings:
        mock_settings.GOOGLE_API_KEY = "fake-gemini-key"
        mock_settings.GROQ_API_KEY = "fake-groq-key"
        mock_settings.GEMINI_MODEL = "gemini-3.5-flash"
        mock_settings.GROQ_MODEL = "openai/gpt-oss-120b"
        
        with patch("app.ai.llm.groq_provider.GroqProvider") as MockGroq:
            prov = router._get_provider("Groq")
            assert prov is not None
            MockGroq.assert_called_once_with(temperature=0.7, max_tokens=128, top_p=0.9)

        with patch("app.ai.llm.gemini_provider.GeminiProvider") as MockGemini:
            prov = router._get_provider("Gemini")
            assert prov is not None
            MockGemini.assert_called_once_with(temperature=0.7, max_tokens=128, top_p=0.9)


# --- 3. Integrate Settings into RAG ---
def test_rag_settings_integration():
    custom_settings = {
        "rag": {
            "top_k": 8,
            "max_chunks": 3,
            "cross_encoder": False,
            "similarity_threshold": 0.85,
        }
    }
    db = create_mock_db(custom_settings)
    retriever = RetrieverService(db)
    
    # Mock vector store similarity_search and BM25 search
    retriever.vector_store = MagicMock()
    
    fake_docs = [
        LangChainDocument(page_content="doc1", metadata={"filename": "a.txt", "chunk_index": 0}),
        LangChainDocument(page_content="doc2", metadata={"filename": "a.txt", "chunk_index": 1}),
        LangChainDocument(page_content="doc3", metadata={"filename": "a.txt", "chunk_index": 2}),
        LangChainDocument(page_content="doc4", metadata={"filename": "a.txt", "chunk_index": 3}),
    ]
    retriever.vector_store.similarity_search.return_value = fake_docs
    
    # Mock BM25 collection get to return nothing to keep it simple
    retriever.vector_store.vector_store._collection.get.return_value = {"ids": [], "documents": [], "metadatas": []}
    
    # Retrieve documents
    with patch("app.ai.retrieval.bm25.BM25Retriever") as MockBM25:
        results = retriever.retrieve("test query")
        
        # Verify candidate search used top_k=8 and respected similarity threshold
        retriever.vector_store.similarity_search.assert_called_once_with(
            query="test query",
            k=8,
            similarity_threshold=0.85
        )
        
        # Verify cross_encoder=False causes retrieval to directly return candidates up to max_chunks=3
        assert len(results) == 3
        assert [r.page_content for r in results] == ["doc1", "doc2", "doc3"]


# --- 4. Integrate document settings ---
def test_document_settings_indexing_integration():
    custom_settings = {
        "documents": {
            "chunk_size": 250,
            "chunk_overlap": 25,
        }
    }
    db = create_mock_db(custom_settings)
    indexing_svc = IndexingService(db)
    
    # Mock document processing and vector store
    fake_doc = Document(id=1, filename="test.txt", file_path="fake/path.txt")
    
    with patch("app.ai.document_processing.DocumentProcessor.extract_text", return_value="This is a test document text."), \
         patch("app.ai.vectorstore.VectorStoreService.add_documents") as mock_add:
        
        # Run indexing
        indexing_svc.index(fake_doc)
        
        # Verify ChunkService was instantiated with the custom settings
        assert indexing_svc.chunk_service.text_splitter._chunk_size == 250
        assert indexing_svc.chunk_service.text_splitter._chunk_overlap == 25


# --- 5. Respect enable_telemetry ---
def test_enable_telemetry_respects_settings():
    # Case A: Telemetry is disabled
    disabled_settings = {
        "telemetry": {
            "enable_telemetry": False,
        }
    }
    db_disabled = create_mock_db(disabled_settings)
    collector = MetricsCollector()
    
    # Record success and failure and verify nothing is added
    fake_telemetry = {"start_time": 0.0, "stages": {}}
    collector.record_success_from_telemetry(fake_telemetry, db=db_disabled)
    collector.record_failure(db=db_disabled)
    
    assert collector.success_count == 0
    assert collector.failed_count == 0
    assert len(collector.history) == 0
    
    # Case B: Telemetry is enabled
    enabled_settings = {
        "telemetry": {
            "enable_telemetry": True,
        }
    }
    db_enabled = create_mock_db(enabled_settings)
    
    collector.record_success_from_telemetry(fake_telemetry, db=db_enabled)
    collector.record_failure(db=db_enabled)
    
    assert collector.success_count == 1
    assert collector.failed_count == 1
    assert len(collector.history) == 1


# --- 6. Test updated Admin Metrics endpoint properties ---
def test_admin_metrics_endpoint_real_properties():
    from app.api.admin import get_admin_metrics
    db = MagicMock(spec=Session)
    
    # Mock queries inside get_admin_metrics
    db.query.return_value.scalar.return_value = 1000
    db.query.return_value.filter.return_value.all.return_value = []
    
    # Mock repos and vector store collection
    with patch("app.api.admin.DocumentRepository") as MockDocRepo, \
         patch("app.api.admin.ConversationRepository") as MockConvRepo, \
         patch("app.api.admin.VectorStoreService") as MockVS:
         
        # Set up repositories to return fake lists
        MockDocRepo.return_value.get_all.return_value = [1, 2, 3]
        MockConvRepo.return_value.get_all.return_value = [1, 2]
        
        # Set up VectorStoreService mock structure
        mock_vs_instance = MockVS.return_value
        mock_vs_instance.vector_store._collection.count.return_value = 150
        
        # Call endpoint logic
        res = get_admin_metrics(db)
        
        # Verify custom metrics returned
        assert "storage_size_bytes" in res
        assert "total_queries" in res
        assert "query_volume" in res
        assert "health" in res
        assert "active_llm_model" in res
        assert res["document_count"] == 3
        assert res["conversation_count"] == 2
        assert res["vector_count"] == 150
        assert res["health"]["backend"] == "healthy"
