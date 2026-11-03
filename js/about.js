/* About: click the portrait to reveal a random hobby (never the same twice in a row) */
(function () {
  'use strict';
  var HOBBIES = [
    'Sewing on a vintage sewing machine',
    'Sharks',
    'Keeping a daily-life blog on Naver'
  ];

  var btn = document.querySelector('.about-photo');
  if (!btn) return;
  var card = btn.querySelector('.about-hobby');
  var num = card.querySelector('.about-hobby__n');
  var text = card.querySelector('.about-hobby__text');
  var prompt = document.querySelector('.about-prompt');
  var last = -1;

  btn.addEventListener('click', function () {
    var n = last;
    while (n === last && HOBBIES.length > 1) n = Math.floor(Math.random() * HOBBIES.length);
    last = n;
    num.textContent = 'Hobby ' + (n + 1) + '/' + HOBBIES.length;
    text.textContent = HOBBIES[n];
    card.hidden = false;
    prompt.textContent = '[Click for another]';
  });
})();
