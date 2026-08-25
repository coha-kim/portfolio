document.addEventListener('DOMContentLoaded', () => {
  const reference = document.querySelector('.link-tree-label:not(.link-tree-label--wide)');
  const wide = document.querySelector('.link-tree-label--wide');
  if (!reference || !wide) return;

  const sync = () => {
    wide.style.width = `${reference.getBoundingClientRect().width}px`;
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sync);
  } else {
    sync();
  }
});
