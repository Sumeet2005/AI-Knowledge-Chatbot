"""
End-to-end integration test for the upload indexing pipeline.

Run with:
    .\\venv\\Scripts\\python test_indexing_pipeline.py

It will:
1. Parse a real PDF from the uploads folder (or create a dummy TXT)
2. Call IndexingService.index()
3. Verify chunks are stored in ChromaDB
4. Query ChromaDB to confirm retrieval works
5. Call IndexingService.delete() and verify cleanup
"""

import sys
import tempfile
import os
from pathlib import Path

# Add backend root to path
sys.path.insert(0, str(Path(__file__).parent))

def test_pipeline():
    print("=" * 60)
    print("INDEXING PIPELINE END-TO-END TEST")
    print("=" * 60)

    # --- Setup: create a dummy Document ORM-like object ---
    class FakeDocument:
        id = 99999
        filename = "_test_doc.txt"
        file_path = None

    # Create a temp text file with real content
    tmpdir = Path(tempfile.mkdtemp())
    txt_file = tmpdir / "_test_doc.txt"
    txt_file.write_text(
        "This is a test document about artificial intelligence and machine learning. "
        "RAG systems retrieve relevant context from a corpus of documents before generating answers. "
        "Embeddings are dense vector representations of text chunks. "
        "ChromaDB stores these embeddings for fast similarity search. "
        "LangChain provides utilities for text splitting, embedding, and retrieval.",
        encoding="utf-8",
    )

    doc = FakeDocument()
    doc.file_path = str(txt_file)

    print(f"\n[Stage 1] Created test file: {txt_file}")

    # --- Import services ---
    from app.ai.document_processing import DocumentProcessor
    from app.ai.chunking import ChunkService
    from app.ai.vectorstore import VectorStoreService
    from app.services.indexing_service import IndexingService

    # --- Stage 1: Parse ---
    print("\n[Stage 2] Extracting text...")
    text = DocumentProcessor.extract_text(str(txt_file))
    print(f"         Extracted {len(text)} chars: {text[:80]}...")
    assert len(text) > 0, "ERROR: No text extracted!"
    print("         ✓ Text extraction OK")

    # --- Stage 2: Chunk ---
    print("\n[Stage 3] Chunking text...")
    chunk_svc = ChunkService(chunk_size=200, chunk_overlap=20)
    chunks = chunk_svc.split_text(text, document_id=doc.id, filename=doc.filename)
    print(f"         Produced {len(chunks)} chunks")
    for i, c in enumerate(chunks):
        print(f"           chunk[{i}]: {c.page_content[:60]}...")
    assert len(chunks) > 0, "ERROR: No chunks produced!"
    print("         ✓ Chunking OK")

    # --- Stage 3: Vector Store ---
    print("\n[Stage 4] Storing chunks in ChromaDB...")
    vs = VectorStoreService()
    vs.add_documents(chunks)
    print(f"         ✓ {len(chunks)} chunks stored")

    # --- Verify retrieval ---
    print("\n[Stage 5] Verifying retrieval...")
    results = vs.similarity_search("What is RAG?", k=3)
    print(f"         Retrieved {len(results)} results")
    for i, r in enumerate(results):
        print(f"           result[{i}]: metadata={r.metadata}  preview={r.page_content[:60]}...")
    assert len(results) > 0, "ERROR: No results returned from similarity search!"
    print("         ✓ Retrieval OK")

    # --- Verify metadata filters ---
    print("\n[Stage 6] Verifying chunk metadata...")
    test_meta = results[0].metadata
    assert "document_id" in test_meta, "ERROR: document_id missing from metadata!"
    assert "filename" in test_meta, "ERROR: filename missing from metadata!"
    assert "chunk_index" in test_meta, "ERROR: chunk_index missing from metadata!"
    print(f"         ✓ Metadata OK: {test_meta}")

    # --- Stage 4: Delete / cleanup ---
    print(f"\n[Stage 7] Deleting vector store chunks for document_id={doc.id}...")
    vs.delete_document(doc.id)
    results_after = vs.similarity_search("What is RAG?", k=10)
    # Filter results to only those belonging to our test doc
    remaining = [r for r in results_after if r.metadata.get("document_id") == doc.id]
    print(f"         Remaining test chunks after delete: {len(remaining)}")
    assert len(remaining) == 0, "ERROR: Chunks not fully deleted from vector store!"
    print("         ✓ Cleanup OK")

    # --- Full pipeline via IndexingService ---
    print("\n[Stage 8] Full IndexingService.index() integration...")
    svc = IndexingService()
    count = svc.index(doc)
    print(f"         IndexingService returned chunk count = {count}")
    assert count > 0, "ERROR: IndexingService.index() returned 0 chunks!"
    print("         ✓ IndexingService OK")

    # cleanup
    svc.delete(doc.id)
    txt_file.unlink()

    print("\n" + "=" * 60)
    print("ALL STAGES PASSED ✓")
    print("=" * 60)


if __name__ == "__main__":
    test_pipeline()
