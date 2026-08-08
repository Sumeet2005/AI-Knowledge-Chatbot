import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import MagicMock, patch

from app.main import app
from app.models import Conversation, Message
from app.dependencies import get_db
from app.repositories import ConversationRepository, MessageRepository


# --- Test fixtures & DB Mocks ---

@pytest.fixture
def client_with_mock_db():
    db = MagicMock(spec=Session)
    
    # Override get_db dependency
    app.dependency_overrides[get_db] = lambda: db
    client = TestClient(app)
    yield client, db
    
    # Cleanup overrides
    app.dependency_overrides.clear()


# --- Tests ---

def test_export_invalid_conversation(client_with_mock_db):
    client, db = client_with_mock_db
    
    # Mock get_conversation returning None
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = None
    db.query.return_value = mock_query
    
    response = client.get("/history/999/export?format=txt")
    assert response.status_code == 404
    assert response.json()["detail"] == "Conversation not found."


def test_export_invalid_format(client_with_mock_db):
    client, db = client_with_mock_db
    
    # Mock valid conversation
    conv = Conversation(id=1, created_at=datetime.utcnow())
    
    mock_query = MagicMock()
    # Mock chain for get_conversation
    mock_query.filter.return_value.first.return_value = conv
    db.query.return_value = mock_query
    
    response = client.get("/history/1/export?format=invalid_fmt")
    assert response.status_code == 400
    assert "Unsupported export format" in response.json()["detail"]


def test_export_txt_format(client_with_mock_db):
    client, db = client_with_mock_db
    
    conv = Conversation(id=42, created_at=datetime(2026, 8, 8, 12, 0, 0))
    messages = [
        Message(
            id=101,
            conversation_id=42,
            role="user",
            content="Hello world",
            created_at=datetime(2026, 8, 8, 12, 1, 0)
        ),
        Message(
            id=102,
            conversation_id=42,
            role="assistant",
            content="Hello user, how can I help you?",
            created_at=datetime(2026, 8, 8, 12, 2, 0)
        ),
    ]
    
    # Set up mock queries
    def mock_query_all(model):
        q = MagicMock()
        if model == Conversation:
            q.filter.return_value.first.return_value = conv
        elif model == Message:
            q.filter.return_value.order_by.return_value.all.return_value = messages
        return q
        
    db.query.side_effect = mock_query_all
    
    response = client.get("/history/42/export?format=txt")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/plain; charset=utf-8"
    assert "attachment; filename=\"conversation_42.txt\"" in response.headers["content-disposition"]
    
    content_text = response.text
    assert "Conversation Export - Thread #42" in content_text
    assert "[2026-08-08 12:01:00] USER:" in content_text
    assert "Hello world" in content_text
    assert "[2026-08-08 12:02:00] ASSISTANT:" in content_text
    assert "Hello user, how can I help you?" in content_text


def test_export_markdown_format(client_with_mock_db):
    client, db = client_with_mock_db
    
    conv = Conversation(id=42, created_at=datetime(2026, 8, 8, 12, 0, 0))
    messages = [
        Message(
            id=101,
            conversation_id=42,
            role="user",
            content="What is RAG?",
            created_at=datetime(2026, 8, 8, 12, 1, 0)
        ),
        Message(
            id=102,
            conversation_id=42,
            role="assistant",
            content="RAG stands for Retrieval-Augmented Generation.",
            created_at=datetime(2026, 8, 8, 12, 2, 0)
        ),
    ]
    
    def mock_query_all(model):
        q = MagicMock()
        if model == Conversation:
            q.filter.return_value.first.return_value = conv
        elif model == Message:
            q.filter.return_value.order_by.return_value.all.return_value = messages
        return q
        
    db.query.side_effect = mock_query_all
    
    response = client.get("/history/42/export?format=md")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/markdown; charset=utf-8"
    assert "attachment; filename=\"conversation_42.md\"" in response.headers["content-disposition"]
    
    content_text = response.text
    assert "# Conversation Export - Thread #42" in content_text
    assert "### **User** - *2026-08-08 12:01:00*" in content_text
    assert "What is RAG?" in content_text
    assert "### **Assistant** - *2026-08-08 12:02:00*" in content_text
    assert "RAG stands for Retrieval-Augmented Generation." in content_text


def test_export_pdf_format(client_with_mock_db):
    client, db = client_with_mock_db
    
    conv = Conversation(id=42, created_at=datetime(2026, 8, 8, 12, 0, 0))
    messages = [
        Message(
            id=101,
            conversation_id=42,
            role="user",
            content="Test query",
            created_at=datetime(2026, 8, 8, 12, 1, 0)
        ),
        Message(
            id=102,
            conversation_id=42,
            role="assistant",
            content="Test answer content with newlines\nand symbols < > &.",
            created_at=datetime(2026, 8, 8, 12, 2, 0)
        ),
    ]
    
    def mock_query_all(model):
        q = MagicMock()
        if model == Conversation:
            q.filter.return_value.first.return_value = conv
        elif model == Message:
            q.filter.return_value.order_by.return_value.all.return_value = messages
        return q
        
    db.query.side_effect = mock_query_all
    
    response = client.get("/history/42/export?format=pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=\"conversation_42.pdf\"" in response.headers["content-disposition"]
    
    # Verify we got a non-empty binary PDF stream (should start with %PDF)
    assert response.content.startswith(b"%PDF")
