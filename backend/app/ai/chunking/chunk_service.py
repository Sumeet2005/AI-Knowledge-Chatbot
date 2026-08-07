from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class ChunkService:
    """
    Splits extracted document text into
    LangChain Document objects with metadata.
    """

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                "",
            ],
        )

    def split_text(
        self,
        text: str,
        document_id: int,
        filename: str,
    ) -> list[Document]:
        """
        Split text into LangChain Document objects.
        """

        chunks = self.text_splitter.split_text(text)

        documents = []

        for index, chunk in enumerate(chunks):
            documents.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": index,
                    },
                )
            )

        return documents