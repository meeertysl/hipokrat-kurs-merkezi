// Hipokrat Kurs Merkezi - site etkileşimleri

// Mobil menü
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('acik'));
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
