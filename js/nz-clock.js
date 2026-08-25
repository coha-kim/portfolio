document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('nz-time');
  if (!el) return;

  const formatter = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const update = () => {
    el.textContent = `${formatter.format(new Date())} AKL, NZ`;
  };

  update();
  setInterval(update, 1000);
});
