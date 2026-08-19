const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const dropzoneContent = document.getElementById("dropzone-content");
const fileSelected = document.getElementById("file-selected");
const fileNameEl = document.getElementById("file-name");
const clearFileBtn = document.getElementById("clear-file");
const submitBtn = document.getElementById("submit-btn");
const form = document.getElementById("transcribe-form");

const statusSection = document.getElementById("status-section");
const statusText = document.getElementById("status-text");
const resultSection = document.getElementById("result-section");
const errorSection = document.getElementById("error-section");
const errorText = document.getElementById("error-text");

const plainTextEl = document.getElementById("plain-text");
const segmentsListEl = document.getElementById("segments-list");
const detectedLangEl = document.getElementById("detected-lang");

let selectedFile = null;
let currentResult = null;
let pollTimer = null;

const STATUS_LABELS = {
  queued: "Sırada bekliyor...",
  loading_model: "Model yükleniyor (ilk seferde biraz sürebilir)...",
  transcribing: "Ses işleniyor, transkript oluşturuluyor...",
};

// ---------------------------------------------------------------------
// File selection (click + drag&drop)
// ---------------------------------------------------------------------

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  if (e.dataTransfer.files.length) {
    setFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) setFile(fileInput.files[0]);
});

clearFileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  setFile(null);
});

function setFile(file) {
  selectedFile = file;
  if (file) {
    fileNameEl.textContent = `${file.name} (${formatSize(file.size)})`;
    dropzoneContent.classList.add("hidden");
    fileSelected.classList.remove("hidden");
    submitBtn.disabled = false;
  } else {
    fileInput.value = "";
    dropzoneContent.classList.remove("hidden");
    fileSelected.classList.add("hidden");
    submitBtn.disabled = true;
  }
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedFile) return;

  resetUI();
  statusSection.classList.remove("hidden");
  statusText.textContent = "Dosya yükleniyor...";
  submitBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("model", document.getElementById("model").value);
  formData.append("language", document.getElementById("language").value);
  formData.append("task", document.getElementById("task").value);

  try {
    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Bilinmeyen bir hata oluştu.");
      return;
    }

    pollStatus(data.job_id);
  } catch (err) {
    showError("Sunucuya bağlanılamadı: " + err.message);
  }
});

function pollStatus(jobId) {
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/status/${jobId}`);
      const data = await res.json();

      if (!res.ok) {
        clearInterval(pollTimer);
        showError(data.error || "İş bulunamadı.");
        return;
      }

      if (data.status === "error") {
        clearInterval(pollTimer);
        showError(data.error || "Transkripsiyon sırasında hata oluştu.");
        return;
      }

      if (data.status === "done") {
        clearInterval(pollTimer);
        showResult(data.result);
        return;
      }

      statusText.textContent = STATUS_LABELS[data.status] || "İşleniyor...";
    } catch (err) {
      clearInterval(pollTimer);
      showError("Durum sorgulanamadı: " + err.message);
    }
  }, 1500);
}

// ---------------------------------------------------------------------
// Result rendering
// ---------------------------------------------------------------------

function showResult(result) {
  currentResult = result;
  statusSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  submitBtn.disabled = false;

  detectedLangEl.textContent = `Algılanan dil: ${result.language}`;
  plainTextEl.value = result.text;

  segmentsListEl.innerHTML = "";
  result.segments.forEach((seg) => {
    const row = document.createElement("div");
    row.className = "segment-row";
    row.innerHTML = `<span class="segment-time">[${formatTime(seg.start)} → ${formatTime(seg.end)}]</span><span class="segment-text">${escapeHtml(seg.text)}</span>`;
    segmentsListEl.appendChild(row);
  });
}

function showError(msg) {
  statusSection.classList.add("hidden");
  errorSection.classList.remove("hidden");
  errorText.textContent = "⚠ " + msg;
  submitBtn.disabled = false;
}

function resetUI() {
  resultSection.classList.add("hidden");
  errorSection.classList.add("hidden");
  if (pollTimer) clearInterval(pollTimer);
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
function pad(n) { return String(n).padStart(2, "0"); }

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ---------------------------------------------------------------------
// Actions: copy / download
// ---------------------------------------------------------------------

document.getElementById("copy-btn").addEventListener("click", () => {
  if (!currentResult) return;
  navigator.clipboard.writeText(currentResult.text).then(() => {
    const btn = document.getElementById("copy-btn");
    const original = btn.textContent;
    btn.textContent = "✓ Kopyalandı";
    setTimeout(() => (btn.textContent = original), 1500);
  });
});

document.getElementById("download-txt-btn").addEventListener("click", () => {
  if (!currentResult) return;
  downloadFile(currentResult.text, "transkript.txt", "text/plain");
});

document.getElementById("download-srt-btn").addEventListener("click", () => {
  if (!currentResult) return;
  downloadFile(buildSrt(currentResult.segments), "transkript.srt", "text/plain");
});

function buildSrt(segments) {
  return segments
    .map((seg, i) => {
      return `${i + 1}\n${srtTime(seg.start)} --> ${srtTime(seg.end)}\n${seg.text}\n`;
    })
    .join("\n");
}

function srtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${String(ms).padStart(3, "0")}`;
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
