from pathlib import Path

from pypdf import PdfReader


class PDFProcessor:
    """
    Extracts text from PDF documents.
    """

    @staticmethod
    def extract(file_path: str) -> str:
        reader = PdfReader(file_path)

        pages = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n".join(pages).strip()