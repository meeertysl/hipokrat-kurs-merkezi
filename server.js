/**
 * Hipokrat Kurs Merkezi Elazığ - Web Sitesi
 * Express tabanlı site + admin paneli
 */
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/* ---------- JSON veri yardımcıları ---------- */
function dataPath(name) {
  return path.join(DATA_DIR, name + '.json');
}
function readJson(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(dataPath(name), 'utf8'));
  } catch (_) {
    return fallback;
  }
}
function writeJson(name, value) {
  fs.writeFileSync(dataPath(name), JSON.stringify(value, null, 2), 'utf8');
}

/* ---------- Varsayılan verileri oluştur ---------- */
if (!fs.existsSync(dataPath('settings'))) {
  writeJson('settings', {
    siteTitle: 'Hipokrat Kurs Merkezi',
    slogan: 'Eğitim & Danışmanlık ve Kütüphane',
    heroText:
      'Elazığ\'da TYT, AYT, LGS ve okula destek kurslarıyla öğrencilerimizi hedeflerine ulaştırıyoruz. Uzman kadromuz, birebir danışmanlık hizmetimiz ve zengin kütüphanemizle yanınızdayız.',
    phone: '0 (424) 000 00 00',
    email: 'info@hipokratkurs.com',
    address: 'Elazığ Merkez',
    workingHours: 'Hafta içi 09:00 - 21:00 / Hafta sonu 09:00 - 18:00',
    facebook: '',
    instagram: '',
    youtube: '',
    mapEmbed: '',
    logo: '/img/logo.svg',
    sessionSecret: crypto.randomBytes(32).toString('hex'),
    admin: {
      username: 'admin',
      // Varsayılan şifre: hipokrat2026 (ilk girişten sonra panelden değiştirin)
      passwordHash: bcrypt.hashSync('hipokrat2026', 10)
    }
  });
}
if (!fs.existsSync(dataPath('about'))) {
  writeJson('about', {
    title: 'Hakkımızda',
    content:
      'Hipokrat Kurs Merkezi, Elazığ\'da eğitim, danışmanlık ve kütüphane hizmetleri sunan bir eğitim kurumudur.\n\nAlanında uzman ve deneyimli eğitim kadromuzla TYT, AYT ve LGS başta olmak üzere tüm sınavlara hazırlık süreçlerinde öğrencilerimizin yanındayız. Birebir eğitim koçluğu ve rehberlik hizmetlerimizle her öğrencimizin bireysel gelişimini yakından takip ediyoruz.\n\nZengin içerikli kütüphanemiz ve sessiz çalışma alanlarımız ile öğrencilerimize verimli bir çalışma ortamı sunuyoruz.',
    mission:
      'Öğrencilerimize kaliteli, ulaşılabilir ve bireysel ihtiyaçlarına uygun eğitim hizmeti sunarak onları akademik hedeflerine ulaştırmak.',
    vision:
      'Elazığ\'ın ve bölgenin en güvenilir, en çok tercih edilen eğitim ve danışmanlık kurumu olmak.'
  });
}
if (!fs.existsSync(dataPath('messages'))) writeJson('messages', []);
if (!fs.existsSync(dataPath('gallery'))) writeJson('gallery', []);

const settingsInit = readJson('settings', {});

/* ---------- Dosya yükleme (multer) ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext);
  }
});
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

const uploadMedia = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.includes(file.mimetype) || VIDEO_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Sadece görsel (jpg, png, gif, webp) ve video (mp4, webm) dosyaları yüklenebilir.'));
  }
});
const uploadLogo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Logo için sadece görsel dosyası yüklenebilir.'));
  }
});

/* ---------- Uygulama ayarları ---------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: settingsInit.sessionSecret || 'hipokrat-gizli',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 saat
  })
);

// Tüm şablonlara ortak veriler
app.use((req, res, next) => {
  res.locals.settings = readJson('settings', {});
  res.locals.isAdmin = !!(req.session && req.session.admin);
  res.locals.path = req.path;
  next();
});

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect('/admin/giris');
}

/* ==================== SİTE SAYFALARI ==================== */
app.get('/', (req, res) => {
  const gallery = readJson('gallery', []);
  res.render('index', {
    about: readJson('about', {}),
    galleryPreview: gallery.filter((g) => g.type === 'image').slice(0, 6)
  });
});

app.get('/hakkimizda', (req, res) => {
  res.render('hakkimizda', { about: readJson('about', {}) });
});

app.get('/galeri', (req, res) => {
  const gallery = readJson('gallery', []);
  res.render('galeri', {
    images: gallery.filter((g) => g.type === 'image'),
    videos: gallery.filter((g) => g.type === 'video')
  });
});

app.get('/iletisim', (req, res) => {
  res.render('iletisim', { sent: req.query.ok === '1', error: null, form: {} });
});

app.post('/iletisim', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !name.trim() || !message || !message.trim()) {
    return res.render('iletisim', {
      sent: false,
      error: 'Lütfen adınızı ve mesajınızı yazın.',
      form: req.body
    });
  }
  const messages = readJson('messages', []);
  messages.unshift({
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 100),
    email: (email || '').trim().slice(0, 100),
    phone: (phone || '').trim().slice(0, 30),
    subject: (subject || '').trim().slice(0, 150),
    message: message.trim().slice(0, 3000),
    date: new Date().toISOString(),
    read: false
  });
  writeJson('messages', messages);
  res.redirect('/iletisim?ok=1');
});

/* ==================== ADMİN PANELİ ==================== */
app.get('/admin/giris', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.render('admin/giris', { error: null });
});

app.post('/admin/giris', (req, res) => {
  const { username, password } = req.body;
  const settings = readJson('settings', {});
  const admin = settings.admin || {};
  if (
    username === admin.username &&
    password &&
    bcrypt.compareSync(password, admin.passwordHash || '')
  ) {
    req.session.admin = { username };
    return res.redirect('/admin');
  }
  res.render('admin/giris', { error: 'Kullanıcı adı veya şifre hatalı.' });
});

app.get('/admin/cikis', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/admin', requireAdmin, (req, res) => {
  const messages = readJson('messages', []);
  const gallery = readJson('gallery', []);
  res.render('admin/panel', {
    stats: {
      totalMessages: messages.length,
      unreadMessages: messages.filter((m) => !m.read).length,
      images: gallery.filter((g) => g.type === 'image').length,
      videos: gallery.filter((g) => g.type === 'video').length
    },
    recentMessages: messages.slice(0, 5)
  });
});

/* ----- Hakkımızda düzenleme ----- */
app.get('/admin/hakkimizda', requireAdmin, (req, res) => {
  res.render('admin/hakkimizda', { about: readJson('about', {}), saved: req.query.ok === '1' });
});

app.post('/admin/hakkimizda', requireAdmin, (req, res) => {
  const about = readJson('about', {});
  about.title = (req.body.title || 'Hakkımızda').trim();
  about.content = (req.body.content || '').trim();
  about.mission = (req.body.mission || '').trim();
  about.vision = (req.body.vision || '').trim();
  writeJson('about', about);
  res.redirect('/admin/hakkimizda?ok=1');
});

/* ----- Gelen mesajlar ----- */
app.get('/admin/mesajlar', requireAdmin, (req, res) => {
  res.render('admin/mesajlar', { messages: readJson('messages', []) });
});

app.post('/admin/mesajlar/:id/oku', requireAdmin, (req, res) => {
  const messages = readJson('messages', []);
  const msg = messages.find((m) => m.id === req.params.id);
  if (msg) {
    msg.read = true;
    writeJson('messages', messages);
  }
  res.redirect('/admin/mesajlar');
});

app.post('/admin/mesajlar/:id/sil', requireAdmin, (req, res) => {
  const messages = readJson('messages', []).filter((m) => m.id !== req.params.id);
  writeJson('messages', messages);
  res.redirect('/admin/mesajlar');
});

/* ----- Galeri yönetimi ----- */
app.get('/admin/galeri', requireAdmin, (req, res) => {
  res.render('admin/galeri', {
    gallery: readJson('gallery', []),
    saved: req.query.ok === '1',
    error: req.query.hata || null
  });
});

app.post('/admin/galeri', requireAdmin, (req, res) => {
  uploadMedia.array('media', 10)(req, res, (err) => {
    if (err) return res.redirect('/admin/galeri?hata=' + encodeURIComponent(err.message));
    if (!req.files || !req.files.length)
      return res.redirect('/admin/galeri?hata=' + encodeURIComponent('Lütfen dosya seçin.'));
    const gallery = readJson('gallery', []);
    for (const file of req.files) {
      gallery.unshift({
        id: crypto.randomUUID(),
        type: VIDEO_TYPES.includes(file.mimetype) ? 'video' : 'image',
        file: '/uploads/' + file.filename,
        title: (req.body.title || '').trim().slice(0, 150),
        date: new Date().toISOString()
      });
    }
    writeJson('gallery', gallery);
    res.redirect('/admin/galeri?ok=1');
  });
});

app.post('/admin/galeri/:id/sil', requireAdmin, (req, res) => {
  const gallery = readJson('gallery', []);
  const item = gallery.find((g) => g.id === req.params.id);
  if (item) {
    const filePath = path.join(__dirname, 'public', item.file.replace(/^\//, ''));
    if (filePath.startsWith(UPLOADS_DIR) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  writeJson('gallery', gallery.filter((g) => g.id !== req.params.id));
  res.redirect('/admin/galeri');
});

/* ----- Sistem ayarları ----- */
app.get('/admin/ayarlar', requireAdmin, (req, res) => {
  res.render('admin/ayarlar', {
    saved: req.query.ok === '1',
    error: req.query.hata || null
  });
});

app.post('/admin/ayarlar', requireAdmin, (req, res) => {
  uploadLogo.single('logo')(req, res, (err) => {
    if (err) return res.redirect('/admin/ayarlar?hata=' + encodeURIComponent(err.message));
    const settings = readJson('settings', {});
    const fields = [
      'siteTitle', 'slogan', 'heroText', 'phone', 'email',
      'address', 'workingHours', 'facebook', 'instagram', 'youtube', 'mapEmbed'
    ];
    for (const f of fields) {
      if (typeof req.body[f] === 'string') settings[f] = req.body[f].trim();
    }
    if (req.file) settings.logo = '/uploads/' + req.file.filename;

    // Şifre değiştirme
    const { currentPassword, newPassword, newPasswordRepeat } = req.body;
    if (newPassword) {
      if (!bcrypt.compareSync(currentPassword || '', settings.admin.passwordHash)) {
        return res.redirect('/admin/ayarlar?hata=' + encodeURIComponent('Mevcut şifre hatalı.'));
      }
      if (newPassword.length < 8) {
        return res.redirect(
          '/admin/ayarlar?hata=' + encodeURIComponent('Yeni şifre en az 8 karakter olmalı.')
        );
      }
      if (newPassword !== newPasswordRepeat) {
        return res.redirect(
          '/admin/ayarlar?hata=' + encodeURIComponent('Yeni şifreler birbiriyle uyuşmuyor.')
        );
      }
      settings.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    }
    if (req.body.adminUsername && req.body.adminUsername.trim()) {
      settings.admin.username = req.body.adminUsername.trim();
    }
    writeJson('settings', settings);
    res.redirect('/admin/ayarlar?ok=1');
  });
});

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Hipokrat Kurs Merkezi sitesi çalışıyor: http://localhost:${PORT}`);
  console.log('Admin paneli: http://localhost:' + PORT + '/admin');
});
