(() => {
  'use strict';
  const registry = window.Orvexa?.pageRegistry;
  if (!registry) return;
  const page = document.body.dataset.activePage;
  const meta = registry[page];
  if (!meta) return;

  document.title = `Orvexa - ${meta.title}`;
  document.body.dataset.productPage = page;

  const applyMeta = () => {
    if (meta.preserveHeading) return;
    const main = document.querySelector('main');
    const h1 = main?.querySelector('h1');
    if (!h1) return;
    h1.textContent = meta.title;
    const parent = h1.parentElement;
    const copy = parent?.querySelector(':scope > p') || h1.nextElementSibling;
    if (copy?.tagName === 'P') copy.textContent = meta.subtitle;
  };

  applyMeta();
  // Dynamic page renderers execute before this script in the product shell. This observer
  // also keeps metadata correct if a page view replaces its header later.
  const main = document.querySelector('main');
  if (main && !meta.preserveHeading) {
    const observer = new MutationObserver(() => {
      applyMeta();
      if (main.querySelector('h1')) observer.disconnect();
    });
    if (!main.querySelector('h1')) observer.observe(main, { childList:true, subtree:true });
  }

  // Keep shared preview controls interactive.
  document.querySelectorAll('[data-blueprint-action]').forEach((button) => {
    button.addEventListener('click', () => window.showToast?.(`${button.textContent.trim()} opened`, 'sparkles'));
  });
})();
