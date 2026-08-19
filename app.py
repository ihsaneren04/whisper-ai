import os
import uuid
import threading
import traceback

from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

import whisper

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"mp3", "wav", "m4a", "mp4", "flac", "ogg", "webm", "mov"}
MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500 MB

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------------------------------------------------------------------
# In-memory job store
#   job_id -> {status, progress_note, result, error, filename}
# ---------------------------------------------------------------------------

jobs = {}
jobs_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Whisper model cache
#   Loading a model is slow, so we keep loaded models in memory and reuse them.
# ---------------------------------------------------------------------------

_model_cache = {}
_model_cache_lock = threading.Lock()

AVAILABLE_MODELS = ["tiny", "base", "small", "medium", "large"]


def get_model(model_name: str):
    with _model_cache_lock:
        if model_name not in _model_cache:
            _model_cache[model_name] = whisper.load_model(model_name)
        return _model_cache[model_name]


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ---------------------------------------------------------------------------
# Background transcription worker
# ---------------------------------------------------------------------------

def run_transcription(job_id: str, filepath: str, model_name: str, language: str, task: str):
    try:
        with jobs_lock:
            jobs[job_id]["status"] = "loading_model"

        model = get_model(model_name)

        with jobs_lock:
            jobs[job_id]["status"] = "transcribing"

        options = {"task": task}
        if language and language != "auto":
            options["language"] = language

        result = model.transcribe(filepath, **options)

        with jobs_lock:
            jobs[job_id]["status"] = "done"
            jobs[job_id]["result"] = {
                "text": result.get("text", "").strip(),
                "language": result.get("language", "unknown"),
                "segments": [
                    {
                        "start": round(seg["start"], 2),
                        "end": round(seg["end"], 2),
                        "text": seg["text"].strip(),
                    }
                    for seg in result.get("segments", [])
                ],
            }
    except Exception as exc:  # noqa: BLE001
        traceback.print_exc()
        with jobs_lock:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = str(exc)
    finally:
        # Clean up the uploaded file once we're done with it
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except OSError:
            pass


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html", models=AVAILABLE_MODELS)


@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "Dosya bulunamadı."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Dosya seçilmedi."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Desteklenmeyen dosya türü. İzin verilenler: {', '.join(sorted(ALLOWED_EXTENSIONS))}"}), 400

    model_name = request.form.get("model", "base")
    if model_name not in AVAILABLE_MODELS:
        model_name = "base"

    language = request.form.get("language", "auto")
    task = request.form.get("task", "transcribe")
    if task not in ("transcribe", "translate"):
        task = "transcribe"

    job_id = uuid.uuid4().hex
    filename = secure_filename(file.filename)
    stored_name = f"{job_id}_{filename}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], stored_name)
    file.save(filepath)

    with jobs_lock:
        jobs[job_id] = {
            "status": "queued",
            "filename": filename,
            "result": None,
            "error": None,
        }

    thread = threading.Thread(
        target=run_transcription,
        args=(job_id, filepath, model_name, language, task),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id})


@app.route("/api/status/<job_id>")
def status(job_id):
    with jobs_lock:
        job = jobs.get(job_id)
        if job is None:
            return jsonify({"error": "Geçersiz iş kimliği."}), 404
        return jsonify(job)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
