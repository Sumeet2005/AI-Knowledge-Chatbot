from pathlib import Path

from app.ai.chunking import ChunkService
from app.ai.document_processing import DocumentProcessor
from app.ai.vectorstore import VectorStoreService

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

vector_store = VectorStoreService()

vector_store.add_documents(documents)

print("Documents stored successfully!")

results = vector_store.similarity_search(
    "What projects has Sumeet worked on?"
)

print(f"\nRetrieved {len(results)} chunks\n")

for index, document in enumerate(results, start=1):
    print("=" * 80)
    print(f"Result {index}")
    print(document.metadata)
    print("-" * 80)
    print(document.page_content[:300])
    print()