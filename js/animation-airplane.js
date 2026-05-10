
// Анимация самолет

(() => {
  const stages = document.querySelector(".stages");
  if (!stages) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stages.classList.add("is-visible");
        observer.unobserve(stages); 
      }
    });
  }, { threshold: 0.2 });

  observer.observe(stages);
})();