class GeminiException(Exception):
    """Base exception for Gemini service failures."""
    def __init__(self, message: str, error_code: str, status_code: int):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(message)

class GeminiQuotaExceeded(GeminiException):
    """429 Quota Exceeded exception."""
    def __init__(self, message: str = "Gemini API quota exceeded. Please try again later."):
        super().__init__(message, "QUOTA_EXCEEDED", 429)

class GeminiUnavailable(GeminiException):
    """503 Service Unavailable exception."""
    def __init__(self, message: str = "Gemini service is temporarily unavailable. Please try again."):
        super().__init__(message, "SERVICE_UNAVAILABLE", 503)

class GeminiTimeout(GeminiException):
    """408 Request Timeout exception."""
    def __init__(self, message: str = "Gemini API request timed out."):
        super().__init__(message, "TIMEOUT", 408)

class GeminiInternalError(GeminiException):
    """500 Internal error exception."""
    def __init__(self, message: str = "An unexpected error occurred in Gemini API."):
        super().__init__(message, "INTERNAL_ERROR", 500)
