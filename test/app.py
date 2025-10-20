from flask import Flask, request, jsonify, render_template    
import os    
from worker import ocr_task, celery  # ✅ import the Celery instance from worker.py
from celery.result import AsyncResult    
    
app = Flask(__name__, static_folder='static', template_folder='templates')    
    
@app.route('/')    
def index():    
    return render_template('index.html')    
    
@app.route('/upload', methods=['POST'])    
def upload():    
    file = request.files['file']    
    lang = request.form.get('language', 'english').lower()    
    file_bytes = file.read()    
    ext = os.path.splitext(file.filename)[1].lower()    
    
    # use the same celery instance to enqueue    
    task = ocr_task.apply_async(args=[file_bytes, ext, lang])    
    return jsonify({'job_id': task.id}), 202    
    
@app.route('/status/<job_id>')    
def status(job_id):    
    # ✅ use the imported celery instance here    
    res = AsyncResult(job_id, app=celery)    
    if res.state == 'PENDING':    
        return jsonify({'status': 'queued', 'progress': 0, 'message': 'Queued'})
    elif res.state == 'PROGRESS':    
        return jsonify({'status': 'running', **res.info})    
    elif res.state == 'SUCCESS':    
        return jsonify({'status': 'done', 'progress': 100, 'message': 'Finished'})
    elif res.state == 'FAILURE':    
        return jsonify({'status': 'error', 'message': str(res.info)})    
    else:    
        return jsonify({'status': res.state})    

@app.route('/result/<job_id>')    
def result(job_id):    
    res = AsyncResult(job_id, app=celery)  # ✅ important    
    if not res.successful():
        return jsonify({'error': 'Not ready or failed', 'status': res.state}), 400
    return res.result['result'], 200, {'Content-Type': 'text/plain; charset=utf-8'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
