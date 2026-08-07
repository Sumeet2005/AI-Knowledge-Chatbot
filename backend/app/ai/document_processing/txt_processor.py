class TXTProcessor:
    """
    Extracts text from TXT documents.
    """

    @staticmethod
    def extract(file_path: str) -> str:
        with open(
            file_path,
            "r",
            encoding="utf-8",
        ) as file:
            return file.read().strip()