FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt requirements.txt
COPY requirements-dev.txt requirements-dev.txt
RUN pip install --upgrade pip && pip install -r requirements.txt -r requirements-dev.txt
COPY app ./app
COPY ../shared /shared
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
