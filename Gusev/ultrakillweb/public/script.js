(function() {
  const animatedElements = document.querySelectorAll('.scroll-animate-up, .scroll-animate-down, .scroll-animate-left, .scroll-animate-right');
  const observerOptions = {
    threshold: 1,
    rootMargin: "0px 0px 0px 0px"
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    observer.observe(el);
  });
})();
