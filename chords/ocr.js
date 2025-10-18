// ocr.js — integrates OCR into main app textarea (#input)
// Requires: pdfjs-dist + tesseract.js (included via CDN in index.html)

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

const ocrFileInput = document.getElementById("ocrFileInput");
const ocrZone = document.getElementById("ocrZone");
const ocrStartBtn = document.getElementById("ocrStartBtn");
const ocrProgress = document.getElementById("ocrProgress");

let selectedOcrFile = null;

// === File selection & drag-drop ===
ocrZone.addEventListener("dragover", e => {
  e.preventDefault();
  ocrZone.classList.add("dragover");
});
ocrZone.addEventListener("dragleave", () => ocrZone.classList.remove("dragover"));
ocrZone.addEventListener("drop", e => {
  e.preventDefault();
  ocrZone.classList.remove("dragover");
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    selectedOcrFile = e.dataTransfer.files[0];
    ocrFileInput.files = e.dataTransfer.files;
    ocrProgress.textContent = "File selected: " + selectedOcrFile.name;
  }
});

ocrFileInput.addEventListener("change", () => {
  if (ocrFileInput.files[0]) {
    selectedOcrFile = ocrFileInput.files[0];
    ocrProgress.textContent = "File selected: " + selectedOcrFile.name;
  }
});

// === Main OCR trigger ===
ocrStartBtn.addEventListener("click", async () => {
  if (!selectedOcrFile) {
    alert("Please select or drop a PDF/image file first.");
    return;
  }

  ocrProgress.textContent = "Processing...";
  try {
    const canvases = await loadCanvases(selectedOcrFile);
    let finalText = "";

    for (let i = 0; i < canvases.length; i++) {
      ocrProgress.textContent = `OCR page ${i + 1}/${canvases.length}...`;
      const pageText = await runOcr(canvases[i], progress =>
        (ocrProgress.textContent = `Page ${i + 1}: ${Math.round(progress * 100)}%`)
      );
      finalText += pageText + "\n\n";
    }

    // inject result into main textarea
    const input = document.getElementById("input");
    input.value = finalText.trim();
    ocrProgress.textContent = "✅ OCR complete. Text inserted into editor.";

    // update the main preview
    if (typeof updateOutput === "function") updateOutput();
  } catch (err) {
    console.error(err);
    ocrProgress.textContent = "❌ OCR failed: " + err.message;
  }
});

// === Helper functions ===
async function loadCanvases(file) {
  const scale = 2.0;
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const canvases = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      canvases.push(canvas);
    }
    return canvases;
  } else if (file.type.startsWith("image/")) {
    const img = await loadImage(file);
    return [imageToCanvas(img, scale)];
  } else {
    throw new Error("Unsupported file type.");
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = e => reject(e);
    img.src = url;
  });
}

function imageToCanvas(img, scale = 2) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth * scale;
  canvas.height = img.naturalHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function runOcr(canvas, onProgress) {
  const result = await Tesseract.recognize(canvas, "eng", {
    logger: m => {
      if (m.status === "recognizing text" && onProgress) onProgress(m.progress);
    }
  });
  return result.data.text || "";
}

