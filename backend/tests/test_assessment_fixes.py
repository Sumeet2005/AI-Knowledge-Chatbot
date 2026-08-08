import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pathlib import Path

from app.main import app
from app.services.document_service import DocumentService
from app.models import Document
from app.ai.embeddings.embedding_service import EmbeddingService
from app.ai.retrieval.retriever_service import RetrieverService
from langchain_core.documents import Document as LangChainDocument

client = TestClient(app)


# --- 1. CORS Test Cases ---

def test_cors_headers_are_configured():
    # Make a preflight CORS request
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type",
    }
    response = client.options("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


# --- 2. Document Deletion Test Cases ---

def test_document_deletion_success():
    fake_doc = Document(
        id=88888,
        filename="test.txt",
        original_filename="test.txt",
        file_path="uploads/test_88888.txt",
        file_size=100
    )
    
    mock_repo = MagicMock()
    mock_repo.get_by_id.return_value = fake_doc
    
    service = DocumentService(mock_repo)
    
    with patch("app.ai.vectorstore.vector_store_service.VectorStoreService") as MockVS, \
         patch("pathlib.Path.exists", return_value=True), \
         patch("pathlib.Path.unlink") as mock_unlink:
        
        mock_vs_instance = MagicMock()
        MockVS.return_value = mock_vs_instance
        
        service.delete_document(88888)
        
        # Verify vector store delete was called
        mock_vs_instance.delete_document.assert_called_once_with(88888)
        # Verify file unlink was called
        mock_unlink.assert_called_once()
        # Verify SQL DB deletion was called
        mock_repo.delete.assert_called_once_with(fake_doc)


def test_document_deletion_failure_stops_db_removal():
    fake_doc = Document(
        id=88888,
        filename="test.txt",
        original_filename="test.txt",
        file_path="uploads/test_88888.txt",
        file_size=100
    )
    
    mock_repo = MagicMock()
    mock_repo.get_by_id.return_value = fake_doc
    
    service = DocumentService(mock_repo)
    
    with patch("app.ai.vectorstore.vector_store_service.VectorStoreService") as MockVS, \
         patch("pathlib.Path.exists", return_value=True), \
         patch("pathlib.Path.unlink") as mock_unlink:
        
        mock_vs_instance = MagicMock()
        mock_vs_instance.delete_document.side_effect = Exception("Chroma Database connection error")
        MockVS.return_value = mock_vs_instance
        
        # Deletion must raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            service.delete_document(88888)
        
        assert exc_info.value.status_code == 500
        assert "Vector store cleanup failed" in exc_info.value.detail
        
        # Verify vector store delete was attempted
        mock_vs_instance.delete_document.assert_called_once_with(88888)
        # Verify file was NOT unlinked
        mock_unlink.assert_not_called()
        # Verify SQL DB deletion was NOT called
        mock_repo.delete.assert_not_called()


# --- 3. Embedding Caching Test Cases ---

def test_embedding_caching_behavior():
    service = EmbeddingService()
    
    # Clear cache first to ensure test isolation
    service.embed_query.cache_clear()
    
    query = "Grounding in retrieval-augmented generation"
    
    # Verify cache hits counting dynamically
    res1 = service.embed_query(query)
    info_after_first = service.embed_query.cache_info()
    
    res2 = service.embed_query(query)
    info_after_second = service.embed_query.cache_info()
    
    assert res1 == res2
    assert info_after_first.hits == 0
    assert info_after_second.hits == 1
    assert service.cache_size == 1


# --- 4. CrossEncoder Caching Test Cases ---

def test_reranker_caching_behavior():
    # Clear retriever cache first to ensure test isolation
    RetrieverService._rerank_cache.clear()
    
    service = RetrieverService()
    
    # Mock reranker predict to dynamically match length of passed pairs
    mock_reranker = MagicMock()
    mock_reranker.predict.side_effect = lambda pairs: [0.95] * len(pairs)
    
    # Mock the Chroma vector store instance attribute of VectorStoreService
    mock_vs_store = MagicMock()
    mock_vs_store._collection.get.return_value = {"ids": [], "documents": [], "metadatas": []}
    
    with patch.object(RetrieverService, "reranker", new_callable=lambda: mock_reranker), \
         patch.object(service.vector_store, "vector_store", new=mock_vs_store):
        
        # We need candidate documents
        candidates = [LangChainDocument(page_content="Deep learning context content", metadata={"filename": "test.pdf", "chunk_index": 1})]
        
        with patch.object(service.vector_store, "similarity_search", return_value=candidates):
            # First retrieval (Cache Miss)
            docs1 = service.retrieve("Query regarding neural architectures", k=1)
            # Second retrieval (Cache Hit)
            docs2 = service.retrieve("Query regarding neural architectures", k=1)
            
            assert docs1 == docs2
            assert len(docs1) == 1
            
            # predict must only have been called once for the unique query-document pair
            assert mock_reranker.predict.call_count == 1
