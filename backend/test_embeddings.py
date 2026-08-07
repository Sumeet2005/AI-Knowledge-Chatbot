from pathlib import Path

from app.ai.chunking import ChunkService
from app.ai.document_processing import DocumentProcessor
from app.ai.embeddings import EmbeddingService

pdf_files = list(Path("uploads").glob("*.pdf"))

if not pdf_files:
    raise FileNotFoundError("No PDF files found.")

pdf_path = pdf_files[0]

text = DocumentProcessor.extract_text(str(pdf_path))

documents = ChunkService().split_text(
    text=text,
    document_id=1,
    filename=pdf_path.name,
)

embedding_service = EmbeddingService()

vectors = embedding_service.embed_documents(documents)

print(f"Chunks: {len(documents)}")
print(f"Vectors: {len(vectors)}")
print(f"Embedding Dimension: {len(vectors[0])}")
print("\nFirst 10 values of first embedding:")
print(vectors[0][:10])