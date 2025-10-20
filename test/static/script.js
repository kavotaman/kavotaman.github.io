const form = document.getElementById('upload-form');    
const bar = document.getElementById('bar');    
const status = document.getElementById('status');    
const textarea = document.getElementById('input');    
let polling;    
    
form.addEventListener('submit', async (e) => {    
  e.preventDefault();    
  const fd = new FormData(form);    
  status.textContent = 'Uploading...';    
  const resp = await fetch('/upload', { method: 'POST', body: fd });    
  if (!resp.ok) {    
    const j = await resp.json().catch(()=>({error:'upload failed'}));    
    status.textContent = 'Upload error: ' + (j.error || resp.statusText);    
    return;    
  }    
  const { job_id } = await resp.json();    
  status.textContent = 'Queued. Job: ' + job_id;    
  bar.style.width = '0%';    
    
  if (polling) clearInterval(polling);    
  polling = setInterval(async () => {    
    const s = await fetch('/status/' + job_id).then(r=>r.json());    
    bar.style.width = (s.progress || 0) + '%';    
    status.textContent = s.message + ' (' + (s.progress || 0) + '%)';    
    if (s.status === 'done') {    
      clearInterval(polling);    
      status.textContent = 'Finished. Fetching text...';    
      const txt = await fetch('/result/' + job_id).then(r=>r.text());    
      textarea.value = txt;    
      status.textContent = 'Ready';    
    }    
    if (s.status === 'error') {    
      clearInterval(polling);    
      status.textContent = 'Error: ' + s.message;    
    }    
  }, 1000);    
});    
