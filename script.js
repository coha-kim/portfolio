document.addEventListener('mousemove', (e) => {
  const x = e.clientX / window.innerWidth;   // 0 to 1
  const y = e.clientY / window.innerHeight;  // 0 to 1

  const weight = 200 + x * 700;        // 200–900
  const slant = y * -15;               // 0 to -15deg

  document.querySelector('.text').style.fontVariationSettings = 
    `'wght' ${weight}, 'slnt' ${slant}`;
});