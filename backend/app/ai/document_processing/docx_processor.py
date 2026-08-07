from docx import Document


class DOCXProcessor:
    """
    Extracts text from DOCX documents.
    """

    @staticmethod
    def extract(file_path: str) -> str:
        document = Document(file_path)

        paragraphs = [
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        ]

        return "\n".join(paragraphs).strip()