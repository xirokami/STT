const header = document.getElementById('head');
const triggerElement = document.getElementById('header-reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      header.classList.add('visible');
    } else {
      header.classList.remove('visible');
    }
  });
}, { threshold: 0.5 }); // 0.5 = когда блок виден на 50%

observer.observe(triggerElement);
