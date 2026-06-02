const NOTES_SHARPS = ["C", "C#", "D", "D#", "E", "F",
                      "F#", "G", "G#", "A", "A#", "B"];
const NOTES_FLATS  = ["C", "Db", "D", "Eb", "E", "F",
                      "Gb", "G", "Ab", "A", "Bb", "B"];

let useSharps = true;
const tuning = ["E", "B", "G", "D", "A", "E"]; // high to low
const tuningLabels = ["e", "B", "G", "D", "A", "E"];
const totalFrets = 24;

let showNotes = true;

// Layout state
let fretStart = 0;
let fretEnd = 24;
let zoom = 100;
let hiddenStrings = new Set();

// Selection state: Set of pitch classes
let selectedPCs = new Set();

const fretboard = document.getElementById("fretboard");
const markerContainer = document.getElementById("fret-markers");

function pitchClassAt(stringNote, fret) {
  const index = NOTES_SHARPS.indexOf(stringNote);
  return (index + fret) % 12;
}

function getFretWidth() {
  return Math.round(50 * zoom / 100);
}

function getFretHeight() {
  return Math.round(30 * zoom / 100);
}

function buildFretboard() {
  const fretWidth = getFretWidth();
  const fretHeight = getFretHeight();
  const cols = fretEnd - fretStart + 1;

  fretboard.innerHTML = "";
  fretboard.style.gridTemplateRows = `repeat(${tuning.length}, ${fretHeight}px)`;

  tuning.forEach((stringNote, sIdx) => {
    const string = document.createElement("div");
    string.className = "string";
    string.dataset.stringIdx = sIdx;
    string.style.gridTemplateColumns = `repeat(${cols}, ${fretWidth}px)`;

    if (hiddenStrings.has(sIdx)) {
      string.classList.add("hidden-string");
    }

    for (let fret = fretStart; fret <= fretEnd; fret++) {
      const pc = pitchClassAt(stringNote, fret);

      const cell = document.createElement("div");
      cell.className = "fret";
      cell.dataset.pc = pc;
      cell.dataset.fret = fret;
      cell.style.height = fretHeight + "px";

      if (fret === 0) {
        cell.classList.add("open-string");
      }

      if (selectedPCs.has(pc)) {
        cell.classList.add("selected");
      }

      if (!showNotes) {
        cell.classList.add("hidden");
      }

      const label = document.createElement("span");
      label.style.fontSize = Math.max(8, Math.round(10 * zoom / 100)) + "pt";
      label.textContent = useSharps ? NOTES_SHARPS[pc] : NOTES_FLATS[pc];
      cell.appendChild(label);

      cell.addEventListener("click", () => {
        const pc = parseInt(cell.dataset.pc);
        if (selectedPCs.has(pc)) {
          selectedPCs.delete(pc);
        } else {
          selectedPCs.add(pc);
        }
        updateAllCells();
        updateURL();
        updateSubtitle();
      });

      string.appendChild(cell);
    }

    fretboard.appendChild(string);
  });

  buildFretMarkers();
}

function updateAllCells() {
  document.querySelectorAll(".fret").forEach(cell => {
    const pc = parseInt(cell.dataset.pc);
    cell.classList.toggle("selected", selectedPCs.has(pc));
  });
}

const singleDots = [3, 5, 7, 9, 15, 17, 19, 21];
const doubleDots = [12, 24];

function buildFretMarkers() {
  const fretWidth = getFretWidth();
  const cols = fretEnd - fretStart + 1;

  markerContainer.innerHTML = "";
  markerContainer.style.gridTemplateColumns = `repeat(${cols}, ${fretWidth}px)`;

  for (let fret = fretStart; fret <= fretEnd; fret++) {
    const marker = document.createElement("div");
    marker.className = "fret-marker";

    if (singleDots.includes(fret)) {
      const dot = document.createElement("div");
      dot.className = "dot";
      marker.appendChild(dot);
    }

    if (doubleDots.includes(fret)) {
      const dot1 = document.createElement("div");
      const dot2 = document.createElement("div");
      dot1.className = dot2.className = "dot";
      marker.append(dot1, dot2);
    }

    markerContainer.appendChild(marker);
  }
}

buildFretboard();

// --- Controls ---

document.getElementById("toggleAccidentals").addEventListener("click", () => {
  useSharps = !useSharps;
  document.querySelectorAll(".fret").forEach(fret => {
    const pc = fret.dataset.pc;
    fret.querySelector("span").textContent = useSharps
      ? NOTES_SHARPS[pc]
      : NOTES_FLATS[pc];
  });
  updateSubtitle();
  updateURL();
});

document.getElementById("toggleNotes").addEventListener("click", () => {
  showNotes = !showNotes;
  document.querySelectorAll(".fret").forEach(fret => {
    fret.classList.toggle("hidden", !showNotes);
  });
});

document.getElementById("toggleLayout").addEventListener("click", () => {
  const panel = document.getElementById("layout-panel");
  panel.classList.toggle("hidden");
});

// Fret range
document.getElementById("fretStart").addEventListener("input", e => {
  fretStart = Math.max(0, Math.min(parseInt(e.target.value) || 0, fretEnd - 1));
  e.target.value = fretStart;
  buildFretboard();
  updateURL();
});

document.getElementById("fretEnd").addEventListener("input", e => {
  fretEnd = Math.min(totalFrets, Math.max(parseInt(e.target.value) || totalFrets, fretStart + 1));
  e.target.value = fretEnd;
  buildFretboard();
  updateURL();
});

// Zoom
document.getElementById("zoomRange").addEventListener("input", e => {
  zoom = parseInt(e.target.value);
  document.getElementById("zoomLabel").textContent = zoom + "%";
  buildFretboard();
});

// String toggles
document.querySelectorAll(".string-toggle").forEach(cb => {
  cb.addEventListener("change", e => {
    const idx = parseInt(e.target.dataset.idx);
    if (e.target.checked) {
      hiddenStrings.delete(idx);
    } else {
      hiddenStrings.add(idx);
    }
    buildFretboard();
    updateURL();
  });
});

// Title input
function onTitleInput() {
  updateURL();
}
window.onTitleInput = onTitleInput;

// Subtitle: list selected note names
function updateSubtitle() {
  const el = document.getElementById("diagram-subtitle");
  if (selectedPCs.size === 0) {
    el.textContent = "";
    return;
  }
  const notes = [...selectedPCs]
    .sort((a, b) => a - b)
    .map(pc => useSharps ? NOTES_SHARPS[pc] : NOTES_FLATS[pc]);
  el.textContent = "Notes: " + notes.join("  ·  ");
}

// --- URL state ---

function encodeState() {
  const title = document.getElementById("songTitle").value;
  const params = new URLSearchParams();

  if (title) params.set("t", title);
  if (selectedPCs.size > 0) params.set("n", [...selectedPCs].sort((a,b)=>a-b).join(","));
  if (!useSharps) params.set("acc", "flat");
  if (fretStart !== 0) params.set("fs", fretStart);
  if (fretEnd !== 24) params.set("fe", fretEnd);
  if (hiddenStrings.size > 0) params.set("hs", [...hiddenStrings].join(","));

  return params.toString();
}

function updateURL() {
  const encoded = encodeState();
  const newUrl = window.location.pathname + (encoded ? "#" + encoded : "");
  history.replaceState(null, "", newUrl);
}

function loadFromURL() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  try {
    const params = new URLSearchParams(hash);

    const title = params.get("t");
    if (title) {
      document.getElementById("songTitle").value = title;
    }

    const notes = params.get("n");
    if (notes) {
      selectedPCs = new Set(notes.split(",").map(Number));
    }

    const acc = params.get("acc");
    if (acc === "flat") {
      useSharps = false;
    }

    const fs = params.get("fs");
    if (fs !== null) {
      fretStart = parseInt(fs);
      document.getElementById("fretStart").value = fretStart;
    }

    const fe = params.get("fe");
    if (fe !== null) {
      fretEnd = parseInt(fe);
      document.getElementById("fretEnd").value = fretEnd;
    }

    const hs = params.get("hs");
    if (hs) {
      hiddenStrings = new Set(hs.split(",").map(Number));
      hiddenStrings.forEach(idx => {
        const cb = document.querySelector(`.string-toggle[data-idx="${idx}"]`);
        if (cb) cb.checked = false;
      });
    }
  } catch(e) {
    console.warn("Could not parse URL state", e);
  }

  buildFretboard();
  updateSubtitle();
}

loadFromURL();

// Share button
document.getElementById("shareURL").addEventListener("click", () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    const toast = document.getElementById("share-toast");
    toast.classList.remove("hidden");
    setTimeout(() => { toast.classList.add("hidden"); }, 2200);
  }).catch(() => {
    prompt("Copy this URL to share:", url);
  });
});

// --- PDF Export ---

document.getElementById("exportPDF").addEventListener("click", async () => {
  const diagram = document.getElementById("diagram");
  const titleText = document.getElementById("songTitle").value.trim() || "Guitar Scale";

  // Determine selected notes string for subtitle
  let notesStr = "";
  if (selectedPCs.size > 0) {
    const notes = [...selectedPCs]
      .sort((a, b) => a - b)
      .map(pc => useSharps ? NOTES_SHARPS[pc] : NOTES_FLATS[pc]);
    notesStr = "Notes: " + notes.join("  ·  ");
  }

  const orientation = document.getElementById("pdfOrientation").value;

  const canvas = await html2canvas(diagram, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format: "letter"
  });

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // --- Title block ---
  const marginX = 28;
  let cursorY = 28;

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(30, 30, 30);
  pdf.text(titleText, marginX, cursorY + 16);
  cursorY += 26;

  // Subtitle: notes
  if (notesStr) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(notesStr, marginX, cursorY + 10);
    cursorY += 16;
  }

  // Fret range annotation
  const rangeStr = `Frets ${fretStart}–${fretEnd}`;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(rangeStr, marginX, cursorY + 10);
  cursorY += 16;

  // Divider line
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.5);
  pdf.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 10;

  // --- Fretboard image ---
  // Hide the title input in the canvas (we're rendering our own title in PDF)
  const titleInput = document.getElementById("songTitle");
  const subtitleEl = document.getElementById("diagram-subtitle");
  const titleInputOriginalDisplay = titleInput.style.display;
  const subtitleOriginalDisplay = subtitleEl.style.display;
  titleInput.style.display = "none";
  subtitleEl.style.display = "none";

  const fbCanvas = await html2canvas(document.getElementById("fretboard"), { scale: 2 });
  const markerCanvas = await html2canvas(markerContainer, { scale: 2 });

  titleInput.style.display = titleInputOriginalDisplay;
  subtitleEl.style.display = subtitleOriginalDisplay;

  const maxWidth  = pageWidth  - marginX * 2;
  const maxHeight = pageHeight - cursorY - 20;

  // Combine fretboard + markers
  const combinedH = fbCanvas.height + markerCanvas.height + 12;
  const ratio = Math.min(maxWidth / fbCanvas.width, maxHeight / combinedH);

  const fbW = fbCanvas.width  * ratio;
  const fbH = fbCanvas.height * ratio;
  const mW  = markerCanvas.width  * ratio;
  const mH  = markerCanvas.height * ratio;

  pdf.addImage(fbCanvas.toDataURL("image/png"),     "PNG", marginX, cursorY, fbW, fbH);
  pdf.addImage(markerCanvas.toDataURL("image/png"), "PNG", marginX, cursorY + fbH + 4, mW, mH);

  pdf.save((titleText.replace(/\s+/g, "-").toLowerCase() || "guitar-scale") + ".pdf");
});
