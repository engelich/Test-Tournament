
// Карусель с карточками: Зациклена, авто-замена 4сек.

(() => {
  const section = document.querySelector(".participants");
  if (!section) return;

  const track = section.querySelector(".participants__track");
  const originalCards = Array.from(section.querySelectorAll(".participant-card"));
  const prevBtn = section.querySelector(".participants__btn--prev");
  const nextBtn = section.querySelector(".participants__btn--next");
  const currentEl = section.querySelector(".participants__current");
  const totalEl = section.querySelector(".participants__total");

  if (!track || originalCards.length === 0 || !prevBtn || !nextBtn || !currentEl || !totalEl) return;

  let currentIndex = 0;
  let visibleCount = getVisibleCount();
  let prependCount = 0;
  let isTransitioning = false;
  let autoplayId = null;
  let transitionGuard = null; 

  let cardWidth = 0;
  let gap = 0;

  function debounce(fn, ms = 120) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function refreshMetrics() {
    const firstCard = track.querySelector(".participant-card");
    cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
    const style = window.getComputedStyle(track);
    gap = parseFloat(style.columnGap || style.gap || "0");
  }

  function updateCounter() {
    const total = originalCards.length;
    totalEl.textContent = String(total);

    if (total <= visibleCount) {
      currentEl.textContent = String(total);
      return;
    }

    const logicalStart = (currentIndex - prependCount + total) % total;
    currentEl.textContent = String(((logicalStart + visibleCount - 1) % total) + 1);
  }

  function render(withTransition = false) {
    if (!cardWidth) return;
    const offset = currentIndex * (cardWidth + gap);
    track.style.transition = withTransition ? "transform 0.45s ease" : "none";
    track.style.transform = `translateX(${-offset}px)`;
    updateCounter();

    if (withTransition) {
      clearTimeout(transitionGuard);
      transitionGuard = setTimeout(() => {
        if (isTransitioning) normalizeLoopPosition();
      }, 600);
    }
  }

  function forceLoadImages(node) {
    node.querySelectorAll("picture.lazy-load, picture.lazy").forEach(picture => {
      picture.querySelectorAll("source[data-srcset]").forEach(source => {
        source.srcset = source.getAttribute("data-srcset");
        source.removeAttribute("data-srcset");
      });
      const img = picture.querySelector("img[data-src]");
      if (img) {
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
      }
      picture.classList.remove("lazy-load", "lazy");
    });
  }

  function rebuildTrack(keepLogicalStart = 0) {
    visibleCount = getVisibleCount();
    prependCount = Math.min(visibleCount, originalCards.length);

    const fragment = document.createDocumentFragment();

    originalCards.slice(-prependCount).forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      forceLoadImages(clone);
      fragment.appendChild(clone);
    });

    originalCards.forEach((node) => fragment.appendChild(node));

    originalCards.slice(0, prependCount).forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      forceLoadImages(clone);
      fragment.appendChild(clone);
    });

    track.innerHTML = "";
    track.appendChild(fragment);

    currentIndex = prependCount + keepLogicalStart;
    refreshMetrics();
    render(false);
  }

  function normalizeLoopPosition() {
    clearTimeout(transitionGuard);

    const total = originalCards.length;
    if (total <= visibleCount) {
      isTransitioning = false;
      return;
    }

    const min = prependCount;
    const max = prependCount + total - 1;

    if (currentIndex > max) {
      currentIndex = min;
      render(false);
    } else if (currentIndex < min) {
      currentIndex = max;
      render(false);
    }

    isTransitioning = false;
  }

  function moveNext() {
    if (isTransitioning || originalCards.length <= visibleCount) return;
    isTransitioning = true;
    currentIndex += 1;
    render(true);
    startAutoplay();
  }

  function movePrev() {
    if (isTransitioning || originalCards.length <= visibleCount) return;
    isTransitioning = true;
    currentIndex -= 1;
    render(true);
    startAutoplay();
  }

  function startAutoplay() {
    stopAutoplay();
    isTransitioning = false;
    clearTimeout(transitionGuard);
    if (originalCards.length <= visibleCount) return;

    function tick() {
      if (!document.hidden) {
        moveNext();
      }
      autoplayId = setTimeout(tick, 4000);
    }

    autoplayId = setTimeout(tick, 4000);
  }

  function stopAutoplay() {
    clearInterval(autoplayId);
    autoplayId = null;
  }

  nextBtn.addEventListener("click", moveNext);
  prevBtn.addEventListener("click", movePrev);
  track.addEventListener("transitionend", normalizeLoopPosition);
  section.addEventListener("mouseenter", stopAutoplay);
  section.addEventListener("mouseleave", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      clearTimeout(transitionGuard);
    } else {
      clearTimeout(transitionGuard);
      isTransitioning = false;
      track.style.transition = "none";
      startAutoplay();
    }
  });

  window.addEventListener("resize", debounce(() => {
    const total = originalCards.length;
    const oldLogicalStart = ((currentIndex - prependCount) % total + total) % total;
    stopAutoplay();
    rebuildTrack(oldLogicalStart);
    startAutoplay();
  }));

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rebuildTrack(0);
      startAutoplay();
    });
  });
})();