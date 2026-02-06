(() => {
  /**
   * @param {HTMLElement} root
   */
  function init(root) {
    if (!root) return;

    /** @type {NodeListOf<HTMLElement>} */
    const questionItems = root.querySelectorAll('.brand-values-faq__question-item');
    /** @type {NodeListOf<HTMLElement>} */
    const images = root.querySelectorAll('.brand-values-faq__image');
    /** @type {HTMLElement|null} */
    const questionsContainer = root.querySelector('.brand-values-faq__questions');
    /** @type {HTMLElement|null} */
    const imageWrapper = root.querySelector('.brand-values-faq__image-wrapper');

    function syncImageHeight() {
      if (questionsContainer && imageWrapper) {
        imageWrapper.style.height = questionsContainer.offsetHeight + 'px';
      }
    }

    /**
     * @param {number} index
     */
    function setActive(index) {
      // Remove active from all items and images
      questionItems.forEach((item) => item.classList.remove('active'));
      images.forEach((img) => img.classList.remove('active'));

      // Add active to clicked item and corresponding image
      if (questionItems[index]) questionItems[index].classList.add('active');
      if (images[index]) images[index].classList.add('active');

      setTimeout(syncImageHeight, 350);
    }

    // default open first
    if (questionItems.length > 0) {
      const firstItem = questionItems.item(0);
      if (firstItem) firstItem.classList.add('active');
      const firstImg = images.item(0);
      if (firstImg) firstImg.classList.add('active');
    }

    questionItems.forEach((item, idx) => {
      item.addEventListener('click', () => {
        setActive(idx);
      });
    });

    // after images load or layout changes
    window.addEventListener('resize', syncImageHeight);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncImageHeight);
    }
    window.requestAnimationFrame(syncImageHeight);
    setTimeout(syncImageHeight, 150);
  }

  function mountAll() {
    document.querySelectorAll('[data-brand-values-faq]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }

  document.addEventListener('shopify:section:load', mountAll);
  document.addEventListener('shopify:section:select', mountAll);
})();


