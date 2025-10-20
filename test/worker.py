import os    
from celery import Celery    
import subprocess, tempfile, uuid    
from pathlib import Path    
    
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')    
celery = Celery('worker', broker=REDIS_URL, backend=REDIS_URL)    
    
celery.conf.update(    
    broker_url=REDIS_URL,    
    result_backend=REDIS_URL,    
    result_persistent=True,    
    task_track_started=True,    
    result_extended=True    
)    
    
LANG_CODE = {    
    'english': 'eng',    
    'portuguese': 'por',    
    'spanish': 'spa'    
}    
    
@celery.task(bind=True)    
def ocr_task(self, file_bytes, ext, lang):    
    self.update_state(state='PROGRESS', meta={'progress': 5, 'message': 'Starting'})
    try:    
        with tempfile.TemporaryDirectory() as tmpdir:    
            tmpdir = Path(tmpdir)    
            input_path = tmpdir / ('input' + ext)    
            with open(input_path, 'wb') as f:    
                f.write(file_bytes)    
    
            if ext != '.pdf':    
                self.update_state(state='PROGRESS', meta={'progress': 20, 'message': 'Converting image to PDF'})
                pdf_output = tmpdir / 'output.pdf'    
                subprocess.run(['magick', str(input_path), str(pdf_output)], check=True)
            else:    
                pdf_output = input_path    

            self.update_state(state='PROGRESS', meta={'progress': 45, 'message': 'Running OCR'})
            ocr_pdf = tmpdir / 'output_ocr.pdf'
            subprocess.run(['ocrmypdf', '--force-ocr', '-l', LANG_CODE[lang], str(pdf_output), str(ocr_pdf)], check=True)

            self.update_state(state='PROGRESS', meta={'progress': 80, 'message': 'Extracting text'})
            text_output = tmpdir / 'output.txt'
            subprocess.run(['pdftotext', '-layout', str(ocr_pdf), str(text_output)], check=True)

            with open(text_output, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        return {'progress': 100, 'message': 'Done', 'result': text}
    except subprocess.CalledProcessError as e:
        raise Exception(f'Command failed: {e}')
    except Exception as e:
        raise Exception(str(e))
