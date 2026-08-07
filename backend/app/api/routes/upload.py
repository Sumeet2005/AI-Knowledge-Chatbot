from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.repositories import DocumentRepository
from app.schemas import DocumentResponse
from app.services import DocumentService, UploadService

router = APIRouter(
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentResponse,
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    repository = DocumentRepository(db)
    service = UploadService(repository)

    return service.upload_document(file)


@router.get(
    "/documents",
    response_model=list[DocumentResponse],
)
def list_documents(
    db: Session = Depends(get_db),
):
    repository = DocumentRepository(db)
    service = DocumentService(repository)

    return service.list_documents()


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