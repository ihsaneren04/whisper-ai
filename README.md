# Whisper UI — Client-Side Transkripsiyon

OpenAI [Whisper](https://github.com/openai/whisper) modeline ONNX Runtime ile erişen, tamamen **client-side** çalışan web arayüzü.

**Live Demo:** [ihsaneren04.github.io/whisper-ai](https://ihsaneren04.github.io/whisper-ai) ← Direkt tarayıcıda çalışır, server gerekli değil!

## Özellikler

- 🎙️ Sürükle-bırak dosya yükleme (mp3, wav, m4a, mp4, flac, ogg, webm, mov)
- 🧠 Model seçimi: `tiny` / `base` / `small` (medium/large tarayıcı belleğinde çalışmayabilir)
- 🌍 Dil seçimi veya otomatik algılama
- 🔁 Transkript veya İngilizceye çeviri
- ⏱️ Zaman damgalı segment görünümü
- ⬇️ `.txt` ve `.srt` olarak indirme
- 🔒 **Tamamen client-side** — dosyalar hiçbir yere gönderilmez

## Kurulum & Deployment

### GitHub Pages'te Deploy Et

1. Bu repo'yu fork'la ya da clone'la:
   ```bash
   git clone https://github.com/ihsaneren04/whisper-ai.git
   cd whisper-ai
   ```

2. Repo settings'ine git:
   - **Settings** → **Pages**
   - **Source:** `main` branch seç
   - **Save** butonuna bas

3. Birkaç dakika sonra sitentin live olacak:
   - `https://KULLANICI_ADIN.github.io/whisper-ai/`

### Local Çalıştır (Testing)

```bash
# İnsan bir local server başlat (Python)
python -m http.server 8000

# Veya npm live-server ile
npx live-server
```

Tarayıcıda `http://localhost:8000` aç.

## Nasıl Çalışır

- **Web Worker** arka planda Whisper ONNX modelini çalıştırır (UI donmuyor)
- Ses dosyası yüklenir → Worker'a gönderilir → Model işleme sokar → Sonuç döner
- Tüm işlem **tarayıcıda** oluyor — backend sunucusu yok!

## Model Boyutları

| Model  | Boyut  | Tarayıcı Uyumluluğu | Hız     |
|--------|--------|---------------------|---------|
| tiny   | ~39M   | ✅ Tüm tarayıcılar  | En hızlı |
| base   | ~74M   | ✅ Modern tarayıcılar | Hızlı  |
| small  | ~244M  | ⚠️ 8GB+ RAM gerekli | Orta    |

## Sınırlamalar

- **Memory limit:** Tarayıcı belleği sınırlıdır. Bilgisayarında <8GB RAM varsa `small` ve üzeri modeller zorlanabilir.
- **Large/Medium:** Çoğu tarayıcıda desteklenmiyor (çok ağır).
- **Chrome en iyisi:** Firefox/Safari'de bellek yönetimi farklı olabilir.

## Teknoloji Stack

- **HTML5 + CSS3 + JavaScript** (pure vanilla)
- **Web Workers** (model işleme tarayıcı donmuyor)
- **Whisper ONNX Runtime** (Hugging Face CDN'den)

## FAQ

**Q: Dosyalarım gizli mi?**
A: Evet, tamamen client-side çalışır. Dosya tarayıcınızdan dışarı çıkmaz.

**Q: İnternet bağlantısı şart mı?**
A: Model ağırlıklarını ilk kez indirmek için evet (Hugging Face CDN'den), sonra cache'de kalıyor. Offline'da çalışmaz.

**Q: Ne kadar hızlı?**
A: Model ve boyutuna bağlı:
- tiny: 10-20 saniye (1 dakika ses)
- base: 20-40 saniye
- small: 60+ saniye

**Q: Larger model ekleyebilir misin?**
A: Tarayıcılar 2-3GB'ı rahat kullanamazlar. `small` en büyük pratik model.

## Lisans

MIT

---

**Kod açık source — improvement'lar için PR'lar merhaba! 🎉**
