from pathlib import Path

from app.ai.chunking import ChunkService
from app.ai.document_processing import DocumentProcessor

pdf_files = list(Path("uploads").glob("*.pdf"))

if not pdf_files:
    raise FileNotFoundError("No PDF files found in uploads folder.")

pdf_path = pdf_files[0]

text = DocumentProcessor.extract_text(str(pdf_path))

service = ChunkService()

documents = service.split_text(
    text=text,
    document_id=1,
    filename=pdf_path.name,
)

print(f"\nTotal Chunks: {len(documents)}\n")

for document in documents:
    print("=" * 80)
    print(document.metadata)
    print("-" * 80)
    print(document.page_content[:300])
    print()