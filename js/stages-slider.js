
// Карусель с этапами: вкл. ма мобильной версии

(() => {
  const section = document.querySelector(".stages");
  if (!section) return;

  const track = section.querySelector(".stages__track");
  const slides = Array.from(section.querySelectorAll(".stages__slide"));
  const prevBtn = section.querySelector(".stages__btn--prev");
  const nextBtn = section.querySelector(".stages__btn--next");
  const dotsWrap = section.querySelector(".stages__dots");
  const viewport = section.querySelector(".stages__viewport");
  const mq = window.matchMedia("(max-width: 768px)");

  if (!track || slides.length === 0 || !prevBtn || !nextBtn || !dotsWrap || !viewport) return;

  let currentIndex = 0;
  let prevIndex = 0;
  let dots = [];
  let slideOffset = getSlideOffset();

  function getTrackGap() {
    const style = window.getComputedStyle(track);
    return parseFloat(style.columnGap || style.gap || "0");
  }

  function getSlideOffset() {
    const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
    return slideWidth + getTrackGap();
  }

  function debounce(fn, ms = 100) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = "stages__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Показать этап ${index + 1}`);
      dot.addEventListener("click", () => goTo(index));
      dotsWrap.appendChild(dot);
      return dot;
    });
  }

  function render() {
    if (!mq.matches) {
      track.style.transform = "";
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      return;
    }

    slideOffset = getSlideOffset();
    track.style.transform = `translate3d(${-currentIndex * slideOffset}px, 0, 0)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === slides.length - 1;

    dots[prevIndex]?.classList.remove("is-active");
    dots[prevIndex]?.setAttribute("aria-current", "false");
    dots[currentIndex]?.classList.add("is-active");
    dots[currentIndex]?.setAttribute("aria-current", "true");

    prevIndex = currentIndex;
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    render();
  }

  prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

  window.addEventListener("resize", debounce(() => {
    slideOffset = getSlideOffset();
    render();
  }));

  buildDots();
  render();
})();
