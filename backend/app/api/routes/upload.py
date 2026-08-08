from fastapi import APIRouter, Depends, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.repositories import DocumentRepository
from app.schemas import DocumentResponse
from app.services import DocumentService, UploadService


def run_indexing(doc_id: int):
    from app.database.session import SessionLocal
    from app.repositories import DocumentRepository
    from app.services.indexing_service import IndexingService
    from loguru import logger

    db_session = SessionLocal()
    try:
        doc_repo = DocumentRepository(db_session)
        doc = doc_repo.get_by_id(doc_id)
        if doc:
            doc.status = "PROCESSING"
            db_session.commit()
            
            idx_service = IndexingService(db_session)
            idx_service.index(doc)
            
            doc.status = "READY"
            db_session.commit()
            logger.info(f"Successfully indexed document {doc.original_filename} (ID: {doc.id})")
    except Exception as e:
        logger.error(f"Failed to index document {doc_id}: {e}")
        try:
            doc = doc_repo.get_by_id(doc_id)
            if doc:
                doc.status = "FAILED"
                db_session.commit()
        except Exception:
            pass
    finally:
        db_session.close()


router = APIRouter(
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentResponse,
)
def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
):
    repository = DocumentRepository(db)
    service = UploadService(repository)

    document = service.upload_document(file)
    background_tasks.add_task(run_indexing, document.id)
    return document


@router.get(
    "/documents",
    response_model=list[DocumentResponse],
)
def list_documents(
    db: Session = Depends(get_db),
):
    repository = DocumentRepository(db)
    service = DocumentService(repository)
    docs = service.list_documents()

    from app.ai.vectorstore.vector_store_service import VectorStoreService
    try:
        vs = VectorStoreService()
        collection = getattr(vs.vector_store, "_collection", None)
        if collection is not None:
            all_data = collection.get(include=["metadatas"])
            metadatas = all_data.get("metadatas", [])
            
            counts = {}
            for meta in metadatas:
                if meta:
                    doc_id = meta.get("document_id")
                    if doc_id is not None:
                        counts[int(doc_id)] = counts.get(int(doc_id), 0) + 1
            
            for doc in docs:
                doc.chunk_count = counts.get(doc.id, 0)
        else:
            for doc in docs:
                doc.chunk_count = 0
    except Exception:
        for doc in docs:
            doc.chunk_count = 0

    return docs


@router.delete(
    "/documents/{document_id}",
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    repository = DocumentRepository(db)
    service = DocumentService(repository)

    service.delete_document(document_id)

    return {
        "message": "Document deleted successfully."
    }


@router.get(
    "/documents/{filename}/view",
)
def view_document(
    filename: str,
    db: Session = Depends(get_db),
):
    import os
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    
    repository = DocumentRepository(db)
    doc = repository.get_by_filename(filename)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    file_path = doc.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document file not found on disk.")
        
    # Infer media type
    ext = os.path.splitext(file_path)[1].lower()
    media_types = {
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    media_type = media_types.get(ext, "application/octet-stream")
    
    return FileResponse(
        path=file_path,
        filename=doc.original_filename,
        media_type=media_type,
    )