FROM python:3.11-slim    
    
RUN apt-get update && apt-get install -y \    
    ocrmypdf imagemagick poppler-utils tesseract-ocr \    
    tesseract-ocr-eng tesseract-ocr-por tesseract-ocr-spa \    
 && sed -i 's|<policy domain="coder" rights="none" pattern="PDF" />|<!-- & -->|' /etc/ImageMagick-6/policy.xml || true \
 && apt-get clean && rm -rf /var/lib/apt/lists/*    
    
WORKDIR /app    
COPY . /app    
RUN pip install -r requirements.txt    
    
CMD ["flask", "run", "--host=0.0.0.0"]
