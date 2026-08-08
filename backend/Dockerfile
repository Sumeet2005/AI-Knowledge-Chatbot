FROM python:3.11-slim

# Prevent python from writing pyc files to disk and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies in cached memory-safe layers
COPY requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn[standard] sqlalchemy pydantic pydantic-settings python-multipart loguru reportlab pypdf python-docx
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir onnxruntime tokenizers transformers huggingface-hub chromadb
RUN pip install --no-cache-dir langchain langchain-core langchain-chroma langchain-huggingface langchain-text-splitters
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose API port
EXPOSE 8001

# Run FastAPI app with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
