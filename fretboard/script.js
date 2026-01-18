const NOTES_SHARPS = ["C", "C#", "D", "D#", "E", "F",
                      "F#", "G", "G#", "A", "A#", "B"];

const NOTES_FLATS  = ["C", "Db", "D", "Eb", "E", "F",
                      "Gb", "G", "Ab", "A", "Bb", "B"];

let useSharps = true;

const tuning = ["E", "B", "G", "D", "A", "E"]; // high to low
const frets = 24;

let showNotes = true;

const fretboard = document.getElementById("fretboard");
const markerContainer = document.getElementById("fret-markers");

function pitchClassAt(stringNote, fret) {
  const index = NOTES_SHARPS.indexOf(stringNote);
  return (index + fret) % 12;
}

function buildFretboard() {
  fretboard.innerHTML = "";

  tuning.forEach(stringNote => {
    const string = document.createElement("div");
    string.className = "string";

    for (let fret = 0; fret <= frets; fret++) {
      const pc = pitchClassAt(stringNote, fret);

      const cell = document.createElement("div");
      cell.className = "fret";
      cell.dataset.pc = pc; // store pitch class

      const label = document.createElement("span");
      label.textContent = useSharps
        ? NOTES_SHARPS[pc]
        : NOTES_FLATS[pc];

      cell.appendChild(label);

      cell.addEventListener("click", () => {
        const pc = cell.dataset.pc;
        const shouldSelect = !cell.classList.contains("selected");

        document.querySelectorAll(`.fret[data-pc="${pc}"]`)
          .forEach(f => {
            f.classList.toggle("selected", shouldSelect);
          });
      });


      string.appendChild(cell);
    }

    fretboard.appendChild(string);
  });
}

buildFretboard();

const singleDots = [3, 5, 7, 9, 15, 17, 19, 21];
const doubleDots = [12, 24];

function buildFretMarkers() {
  markerContainer.innerHTML = "";

  for (let fret = 0; fret <= 24; fret++) {
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

buildFretMarkers();

document
  .getElementById("toggleAccidentals")
  .addEventListener("click", () => {
    useSharps = !useSharps;

    document.querySelectorAll(".fret").forEach(fret => {
      const pc = fret.dataset.pc;
      fret.querySelector("span").textContent = useSharps
        ? NOTES_SHARPS[pc]
        : NOTES_FLATS[pc];
    });
  });

document.getElementById("toggleNotes").addEventListener("click", () => {
  showNotes = !showNotes;
  document.querySelectorAll(".fret").forEach(fret => {
    fret.classList.toggle("hidden", !showNotes);
  });
});


document.getElementById("exportPDF").addEventListener("click", async () => {
  const title = document.getElementById("songTitle").value.trim();
  const diagram = document.getElementById("diagram");
  const canvas = await html2canvas(diagram);
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape");

  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, width - 20, height);
  pdf.save("guitar-scale.pdf");
});

