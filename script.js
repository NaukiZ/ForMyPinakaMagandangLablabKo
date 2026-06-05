/* ===========================
   LOVELY WEBSITE — script.js
   =========================== */

// ─── STATE ───────────────────────────────────────────────
const PASSCODE    = '5129';
const TARGET_DATE = new Date('2027-05-12T00:00:00');

let currentPage   = 1;
let unlockedPages = false;
let enteredCode   = '';
let countdownInterval;
let letterOpened  = false;
let typewriterDone = false;

// ─── DOM REFS ────────────────────────────────────────────
const padlock     = document.getElementById('padlock');
const padlockMsg  = document.getElementById('padlockMsg');
const codeDisplay = document.getElementById('codeDisplay');
const dots        = codeDisplay.querySelectorAll('.dot');
const bgMusic     = document.getElementById('bgMusic');
const musicBtn    = document.getElementById('musicBtn');
const musicIcon   = musicBtn.querySelector('.music-icon');

// ─── HEARTS BACKGROUND ──────────────────────────────────
(function spawnHearts() {
  const bg = document.getElementById('heartsBg');
  const heartChars = ['❤️'];

  function createHeart() {
    const el      = document.createElement('span');
    el.classList.add('heart-fall');
    el.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];

    const size     = 0.7 + Math.random() * 1.2;
    const left     = Math.random() * 100;
    const duration = 6 + Math.random() * 8;
    const delay    = Math.random() * 8;

    el.style.cssText = `
      left: ${left}%;
      font-size: ${size}rem;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    bg.appendChild(el);

    setTimeout(() => el.remove(), (duration + delay) * 1000 + 500);
  }

  // initial burst
  for (let i = 0; i < 20; i++) createHeart();
  setInterval(createHeart, 600);
})();

// ─── MUSIC ──────────────────────────────────────────────
let musicPlaying = false;

function tryPlayMusic() {
  if (!musicPlaying) {
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicIcon.textContent = '🎵';
      musicBtn.classList.remove('paused');
    }).catch(() => {});
  }
}

musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicIcon.textContent = '🎵';
    musicBtn.classList.add('paused');
    musicPlaying = false;
  } else {
    tryPlayMusic();
  }
});

// Start music on very first numpad tap (user interaction unlocks autoplay)
document.querySelectorAll('.num-btn').forEach(btn => {
  btn.addEventListener('click', tryPlayMusic, { once: true });
});

// ─── PAGE NAVIGATION ─────────────────────────────────────
function goToPage(num) {
  if (num === 1) {
    // reset padlock
    enteredCode = '';
    updateDots();
    padlockMsg.textContent = '';
    padlock.classList.remove('unlocked', 'shake');
    showPage(1);
    return;
  }
  if (!unlockedPages) return;
  showPage(num);
}

function showPage(num) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    // re-trigger slide-up on re-visit
    const content = p.querySelector('.slide-up');
    if (content) {
      content.style.animation = 'none';
      void content.offsetWidth;
      content.style.animation = '';
    }
  });

  const target = document.getElementById('page' + num);
  if (!target) return;
  target.classList.add('active');
  currentPage = num;

  // page-specific init
  if (num === 2 && !countdownInterval) startCountdown();
  if (num === 5 && !letterOpened) {
    document.getElementById('envOuter').classList.remove('opened');
    document.getElementById('paperWrap').classList.remove('open');
    letterOpened  = false;
    typewriterDone = false;
    document.getElementById('letterBody').innerHTML = '';
  }
}

// ─── PADLOCK / NUMPAD ────────────────────────────────────
document.querySelectorAll('.num-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.num;

    // ripple click animation
    btn.style.transition = 'none';
    btn.style.transform  = 'scale(0.82)';
    setTimeout(() => {
      btn.style.transition = '';
      btn.style.transform  = '';
    }, 120);

    if (v === 'clear') {
      enteredCode = '';
      updateDots();
      padlockMsg.textContent = '';
      return;
    }
    if (v === 'enter') {
      checkCode();
      return;
    }
    if (enteredCode.length < 4) {
      enteredCode += v;
      updateDots();
      if (enteredCode.length === 4) checkCode();
    }
  });
});

function updateDots() {
  dots.forEach((d, i) => {
    d.classList.toggle('filled', i < enteredCode.length);
  });
}

function checkCode() {
  if (enteredCode === PASSCODE) {
    // correct!
    padlock.classList.remove('shake');
    padlock.classList.add('unlocked');
    padlockMsg.textContent = 'WOW SUPER GALINGG';
    padlockMsg.style.color = '#ff4f81';
    unlockedPages = true;
    setTimeout(() => showPage(2), 1200);
  } else {
    // wrong
    padlockMsg.textContent = 'Mali po, try mo ulit';
    padlockMsg.style.color = '#ff4f81';
    padlock.classList.remove('shake');
    void padlock.offsetWidth;
    padlock.classList.add('shake');
    setTimeout(() => {
      enteredCode = '';
      updateDots();
    }, 600);
  }
}

// ─── COUNTDOWN ──────────────────────────────────────────
function startCountdown() {
  function tick() {
    const now  = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      document.getElementById('days').textContent    = '00';
      document.getElementById('hours').textContent   = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      clearInterval(countdownInterval);
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    document.getElementById('days').textContent    = String(d).padStart(2,'0');
    document.getElementById('hours').textContent   = String(h).padStart(2,'0');
    document.getElementById('minutes').textContent = String(m).padStart(2,'0');
    document.getElementById('seconds').textContent = String(s).padStart(2,'0');
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

// ─── POLAROID DRAG ──────────────────────────────────────
(function initDrag() {
  const polaroids = document.querySelectorAll('.polaroid');

  polaroids.forEach(card => {
    let isDragging = false;
    let startX, startY, origX, origY;

    function getPos(e) {
      return e.touches
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX,            y: e.clientY            };
    }

    function onStart(e) {
      // don't start drag if clicking the file input area
      if (e.target.closest('.polaroid-img')) return;
      const pos  = getPos(e);
      const rect = card.getBoundingClientRect();
      isDragging = true;
      startX = pos.x;
      startY = pos.y;
      origX  = rect.left;
      origY  = rect.top;
      card.classList.add('dragging');
      card.style.position = 'fixed';
      card.style.left     = origX + 'px';
      card.style.top      = origY + 'px';
      card.style.zIndex   = 200;
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      const pos = getPos(e);
      card.style.left = (origX + pos.x - startX) + 'px';
      card.style.top  = (origY + pos.y - startY) + 'px';
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('dragging');
      // animate back to original grid position
      card.style.transition = 'left 0.5s cubic-bezier(0.34,1.56,0.64,1), top 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      card.style.left = origX + 'px';
      card.style.top  = origY + 'px';
      setTimeout(() => {
        card.style.position   = '';
        card.style.left       = '';
        card.style.top        = '';
        card.style.zIndex     = '';
        card.style.transition = '';
      }, 520);
    }

    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup',  onEnd);
    document.addEventListener('touchend', onEnd);
  });
})();

// ─── POLAROID IMAGE UPLOAD ──────────────────────────────

// Load saved photos from localStorage on startup
function loadSavedPhotos() {
  document.querySelectorAll('.polaroid').forEach((card, i) => {
    const saved = localStorage.getItem('polaroid_' + i);
    if (saved) {
      const photo       = card.querySelector('.polaroid-photo');
      const placeholder = card.querySelector('.polaroid-placeholder');
      photo.src         = saved;
      photo.classList.add('loaded');
      placeholder.style.display = 'none';
      photo.style.zIndex        = '3';
    }
  });
}
loadSavedPhotos();

document.querySelectorAll('.img-upload').forEach((input, i) => {
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const card        = document.querySelectorAll('.polaroid')[i];
      const photo       = card.querySelector('.polaroid-photo');
      const placeholder = card.querySelector('.polaroid-placeholder');
      photo.src         = ev.target.result;
      photo.classList.add('loaded');
      placeholder.style.display = 'none';
      photo.style.zIndex        = '3';
      // Save to localStorage so it persists after refresh
      try {
        localStorage.setItem('polaroid_' + i, ev.target.result);
      } catch (err) {
        // localStorage full (images are large) — warn gently
        console.warn('Could not save photo ' + i + ' to storage:', err);
        alert('⚠️ Storage full! Try removing a photo first or use smaller images.');
      }
    };
    reader.readAsDataURL(file);
  });
});

// ─── ENVELOPE / LETTER ──────────────────────────────────
const LETTER_TEXT = `Marami pa sana akong gustong sabihin sayo, pero minsan words are not enough to express how much i love you. Kaya ginawa ko tong website para lang sayo, with all my heart, time, and effort. Every part nito ginawa ko because i want you to have something that reminds you how special you are to me. Even na hihirapan ako sabihin to minsan sa chats, I hope sana itong website shows the feelings that i carry for you every day.

I know that may flaws ka rin as a person, may mga bagay ka rin na ayaw mo rin sa sarili mo. But when i met you and you tell all the stories na nangyari sayo, you think na telling me those stories na nakakaturnoff talaga means di na kita magugustuhan, but no. I see you as a honest, good person, and a kind hearted girl, wag ka mag alala. Kahit maging sino ka man, mamahalin kita the way you deserved, the way you want.

I also want to thank you for accepting me into your life. Knowing na gaano ka ka manhater, it means a lot that you trusted me enough to become your friend. Being your friend is already something im grateful for, but hehehehe sana in the future tayo na talaga (imsodelusional). Ano man mangyari, mamahalin kita ng superduper na tipong mag sasawa kana, joke hehhehhe loveu.

If theres a day na mamiss mo ako, feel lonely, or simply want to remember how much someone cared about you, pwede po ikaw pumunta sa website and open this letter lagi. And if ever man dumating yung oras na hindi na tayo nag uusap or life takes us in different directions, I hope na never mong makalimutan to. I hope na maalala mo in the future na there was a sweet boy who sincerely cared about you, loved you, and created this small page just to remind you that you are deserved to be loved by someone (huhuhu paulitnulit sinasabi ko sorry, i love you nalang po hehehe).`;

// ✏️  TO CHANGE THE LETTER: edit the LETTER_TEXT variable above (around line 160 in this file).

function openEnvelope() {
  if (letterOpened) return;
  letterOpened = true;

  const envOuter  = document.getElementById('envOuter');
  const paperWrap = document.getElementById('paperWrap');
  const body      = document.getElementById('letterBody');

  // 1. fold flap open + hide seal & hint
  envOuter.classList.add('opened');

  // 2. after flap animation, slide paper up
  setTimeout(() => {
    paperWrap.classList.add('open');
    // 3. start typewriter after paper begins rising
    setTimeout(() => startTypewriter(body, LETTER_TEXT), 500);
  }, 600);
}

function startTypewriter(el, text) {
  if (typewriterDone) return;
  el.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.appendChild(cursor);

  let i = 0;
  const speed = 28; // ms per char

  function type() {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, speed);
    } else {
      cursor.remove();
      typewriterDone = true;
    }
  }
  type();
}
