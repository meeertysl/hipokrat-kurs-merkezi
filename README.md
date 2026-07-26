# Hipokrat Kurs Merkezi - Elazığ

**Eğitim & Danışmanlık ve Kütüphane**

Hipokrat Kurs Merkezi'nin (Elazığ) resmi web sitesi. Admin paneli üzerinden içerik yönetimi yapılabilen, Node.js + Express tabanlı bir web uygulamasıdır.

## Özellikler

### Site
- 🏠 **Ana Sayfa** — Tanıtım, hizmetler (Eğitim / Danışmanlık / Kütüphane), galeri önizlemesi
- 📝 **Hakkımızda** — Kurum tanıtımı, misyon ve vizyon
- 🖼️ **Galeri** — Kurumun fotoğraf ve videoları (lightbox destekli)
- 💬 **Bize Ulaşın** — İletişim formu, iletişim bilgileri, harita
- 📱 Mobil uyumlu (responsive) tasarım, logoya uygun sarı/koyu gri renk paleti

### Admin Paneli (`/admin`)
- 📊 **Genel Bakış** — Mesaj ve galeri istatistikleri, son gelen mesajlar
- 📝 **Hakkımızda Düzenleme** — Sayfa başlığı, içerik, misyon ve vizyon metinleri
- 💬 **Gelen Mesajlar** — İletişim formundan gelen mesajları görüntüleme, okundu işaretleme, silme
- 🖼️ **Galeri Yönetimi** — Fotoğraf ve video yükleme (çoklu), silme
- ⚙️ **Sistem Ayarları** — Site adı, slogan, logo, iletişim bilgileri, sosyal medya, harita, yönetici hesabı ve şifre değiştirme

## Kurulum

```bash
npm install
npm start
```

Site: http://localhost:3000
Admin paneli: http://localhost:3000/admin

### Varsayılan Yönetici Bilgileri

| Alan | Değer |
|------|-------|
| Kullanıcı adı | `admin` |
| Şifre | `hipokrat2026` |

> ⚠️ **Önemli:** İlk girişten sonra **Ayarlar** sayfasından şifrenizi mutlaka değiştirin.

## Teknik Detaylar

- **Sunucu:** Node.js (≥18) + Express
- **Şablon:** EJS
- **Veri:** JSON dosyaları (`data/` klasörü, ilk çalıştırmada otomatik oluşur)
- **Dosya yükleme:** Multer (`public/uploads/` klasörüne)
- **Kimlik doğrulama:** express-session + bcryptjs

`data/` klasörü ve `public/uploads/` içeriği (mesajlar, ayarlar, yüklenen medya) sürüm kontrolüne dahil edilmez; sunucu ilk çalıştığında varsayılan verilerle otomatik oluşturulur.

## Yayına Alma (Deploy)

Herhangi bir Node.js barındırma hizmetinde çalışır (Railway, Render, VPS vb.):

1. Depoyu sunucuya klonlayın
2. `npm install && npm start`
3. `PORT` ortam değişkeni ile portu değiştirebilirsiniz

> Not: Veriler JSON dosyalarında tutulduğu için kalıcı disk (persistent storage) olan bir barındırma tercih edin.

## Lisans

MIT
