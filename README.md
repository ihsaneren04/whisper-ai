# Whisper UI — Transcription

OpenAI [Whisper](https://github.com/openai/whisper) modeline ONNX Runtime ile erişen web arayüzü.

**Live Demo:** [ihsaneren04.github.io/whisper-ai](https://ihsaneren04.github.io/whisper-ai)

## Özellikler

- 🎙️ Sürükle-bırak dosya yükleme (mp3, wav, m4a, mp4, flac, ogg, webm, mov)
- 🧠 Model seçimi: `tiny` / `base` / `small` (medium/large tarayıcı belleğinde çalışmayabilir)
- 🌍 Dil seçimi veya otomatik algılama
- 🔁 Transkript veya İngilizceye çeviri
- ⏱️ Zaman damgalı segment görünümü
- ⬇️ `.txt` ve `.srt` olarak indirme

## Model Boyutları

| Model  | Boyut  | Tarayıcı Uyumluluğu | Hız     |
|--------|--------|---------------------|---------|
| tiny   | ~39M   | ✅ Tüm tarayıcılar  | En hızlı |
| base   | ~74M   | ✅ Modern tarayıcılar | Hızlı  |
| small  | ~244M  | ⚠️ 8GB+ RAM gerekli | Orta    |

## Lisans

MIT
