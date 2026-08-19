Readme · MD
# Whisper UI
 
OpenAI [Whisper](https://github.com/openai/whisper) için basit, yerel çalışan bir web arayüzü. Ses/video dosyası yükle, transkript et, düz metin veya `.srt` altyazı olarak indir.
 
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![Flask](https://img.shields.io/badge/flask-3.x-black)
 
## Özellikler
 
- 🎙️ Sürükle-bırak dosya yükleme (mp3, wav, m4a, mp4, flac, ogg, webm, mov)
- 🧠 Model seçimi: `tiny` / `base` / `small` / `medium` / `large`
- 🌍 Dil seçimi veya otomatik algılama
- 🔁 Transkript veya İngilizceye çeviri
- ⏱️ Zaman damgalı segment görünümü
- ⬇️ `.txt` ve `.srt` olarak indirme
- 🔒 Tamamen yerel çalışır — dosyalar sunucudan dışarı çıkmaz
## Kurulum
 
```bash
git clone https://github.com/KULLANICI_ADIN/whisper-ui.git
cd whisper-ui
 
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
 
pip install -r requirements.txt
```
 
> **Not:** `openai-whisper` ayrıca sistemde [ffmpeg](https://ffmpeg.org/) kurulu olmasını gerektirir.
>
> - macOS: `brew install ffmpeg`
> - Ubuntu/Debian: `sudo apt install ffmpeg`
> - Windows: [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
 
## Çalıştırma
 
```bash
python app.py
```
 
Tarayıcıda [http://localhost:5000](http://localhost:5000) adresini aç.
 
## Kullanım
 
1. Ses veya video dosyasını sürükle-bırak ile yükle ya da seç
2. Model boyutunu seç (büyük model = daha doğru, daha yavaş)
3. Dili seç veya otomatik algılamaya bırak
4. "Transkript Et" butonuna bas
5. Sonucu düz metin ya da zaman damgalı segmentler olarak incele, kopyala veya indir
## GPU ile hızlandırma
 
Whisper otomatik olarak CUDA destekli GPU varsa onu kullanır. GPU yoksa CPU üzerinde çalışır (küçük modellerle makul hızda).
 
## Model boyutları
 
| Model  | Parametre | Yaklaşık VRAM | Hız     |
|--------|-----------|----------------|---------|
| tiny   | 39 M      | ~1 GB          | En hızlı |
| base   | 74 M      | ~1 GB          | Hızlı   |
| small  | 244 M     | ~2 GB          | Orta    |
| medium | 769 M     | ~5 GB          | Yavaş   |
| large  | 1550 M    | ~10 GB         | En yavaş |
 
## Proje yapısı
 
```
whisper-ui/
├── app.py              # Flask backend
├── requirements.txt
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── app.js
└── uploads/             # Geçici yüklemeler (işlem sonrası silinir)
```
 
## Lisans
 
MIT