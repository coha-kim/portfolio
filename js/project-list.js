document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('project-list');
  if (!list) return;

  const items = list.querySelectorAll('.project-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-active', entry.intersectionRatio >= 0.6);
    });
  }, {
    root: list,
    threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
  });

  items.forEach((item) => observer.observe(item));
});
