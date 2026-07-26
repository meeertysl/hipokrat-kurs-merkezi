// Hipokrat Kurs Merkezi - site etkileşimleri

// Mobil menü
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('acik'));
}

// Kaydırınca beliren öğeler (scroll reveal)
const revealOgeleri = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealOgeleri.length) {
  const gozlemci = new IntersectionObserver(
    (girisler) => {
      girisler.forEach((g) => {
        if (g.isIntersecting) {
          g.target.classList.add('gorunur');
          gozlemci.unobserve(g.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealOgeleri.forEach((el) => gozlemci.observe(el));
} else {
  revealOgeleri.forEach((el) => el.classList.add('gorunur'));
}

// Navbar kaydırma gölgesi
const navbar = document.querySelector('.navbar');
if (navbar) {
  const golgeGuncelle = () => navbar.classList.toggle('kaydirildi', window.scrollY > 10);
  window.addEventListener('scroll', golgeGuncelle, { passive: true });
  golgeGuncelle();
}

// Yorum şeridi: kesintisiz akış için içeriği çoğalt
const kaydirici = document.querySelector('[data-yorum-kaydirici]');
if (kaydirici) {
  const serit = kaydirici.querySelector('.yorum-serit');
  const azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (serit && !azalt) {
    const kartlar = Array.from(serit.children);
    if (kartlar.length < 3) {
      // Az yorum varsa akıtma, ortala
      serit.style.animation = 'none';
      serit.style.width = 'auto';
      serit.style.justifyContent = 'center';
      serit.style.margin = '0 auto';
    } else {
      // translateX(-50%) döngüsü için içerik iki katına çıkarılır
      kartlar.forEach((k) => {
        const kopya = k.cloneNode(true);
        kopya.setAttribute('aria-hidden', 'true');
        serit.appendChild(kopya);
      });
      // Kart sayısına göre hız: kart başına ~5 sn
      serit.style.animationDuration = Math.max(20, kartlar.length * 5) + 's';
    }
  }
}

// Galeri lightbox
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');
  document.querySelectorAll('.galeri-item[data-buyuk]').forEach((item) => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.buyuk;
      lightbox.classList.add('acik');
    });
  });
  const kapat = () => {
    lightbox.classList.remove('acik');
    lightboxImg.src = '';
  };
  lightbox.querySelector('.kapat').addEventListener('click', kapat);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) kapat();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') kapat();
  });
}
