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

// ─── MUSIC PLAYER ────────────────────────────────────────

// ✏️ ADD YOUR 7 SONGS HERE — put the mp3 files in the same folder as index.html
const SONGS = [
  { title: 'Sunsetz - CAS',  src: 'okay.mp3'  },
  { title: 'Hold On Till May - PTV',  src: 'okay2.mp3'  },
  { title: 'I Wanna Be Yours - AM',  src: 'okay3.mp3'  },
  { title: 'Baby Came Home 2 Valentines - TN',  src: 'okay4.mp3'  },
  { title: 'Keep On Loving You - CAS',  src: 'okay5.mp3'  },
  { title: 'Araw-araw - B&B',  src: 'okay6.mp3'  },
  { title: 'The only exception - Paramore',  src: 'okay7.mp3'  },
];

const bgMusic        = document.getElementById('bgMusic');
const musicBtn       = document.getElementById('musicBtn');
const musicIcon      = document.getElementById('musicIcon');
const playerPanel    = document.getElementById('playerPanel');
const playerClose    = document.getElementById('playerClose');
const songListEl     = document.getElementById('songList');
const nowPlayingName = document.getElementById('nowPlayingName');
const progressBar    = document.getElementById('progressBar');
const timeElapsed    = document.getElementById('timeElapsed');
const timeDuration   = document.getElementById('timeDuration');
const btnPlayPause   = document.getElementById('btnPlayPause');
const btnPrev        = document.getElementById('btnPrev');
const btnNext        = document.getElementById('btnNext');
const btnRewind      = document.getElementById('btnRewind');
const btnSkip        = document.getElementById('btnSkip');

let musicPlaying  = false;
let currentTrack  = parseInt(localStorage.getItem('player_track') || '0');
let panelOpen     = false;
let holdTimer     = null;

// ── Build song list ──
SONGS.forEach((song, i) => {
  const item = document.createElement('div');
  item.className = 'song-item' + (i === currentTrack ? ' active' : '');
  item.innerHTML = `<span class="song-num">${i + 1}</span><span class="song-name">${song.title}</span><span class="song-note">♪</span>`;
  item.addEventListener('click', () => loadTrack(i, true));
  songListEl.appendChild(item);
});

function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function updateSongList() {
  document.querySelectorAll('.song-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentTrack);
  });
}

function loadTrack(index, play) {
  currentTrack = index;
  localStorage.setItem('player_track', index);
  bgMusic.src = SONGS[index].src;
  nowPlayingName.textContent = SONGS[index].title;
  updateSongList();
  progressBar.value = 0;
  timeElapsed.textContent  = '0:00';
  timeDuration.textContent = '0:00';

  if (play) {
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicIcon.textContent    = '🎵';
      btnPlayPause.textContent = '||';
      btnPlayPause.style.paddingLeft = '0px';
      musicBtn.classList.remove('paused');
    }).catch(() => {});
  }
}

// Load last track on startup (but don't autoplay yet)
bgMusic.src = SONGS[currentTrack].src;
nowPlayingName.textContent = SONGS[currentTrack].title;
updateSongList();

// ── Progress bar update ──
bgMusic.addEventListener('timeupdate', () => {
  if (!bgMusic.duration) return;
  const pct = (bgMusic.currentTime / bgMusic.duration) * 100;
  progressBar.value            = pct;
  timeElapsed.textContent      = formatTime(bgMusic.currentTime);
  timeDuration.textContent     = formatTime(bgMusic.duration);
});

bgMusic.addEventListener('loadedmetadata', () => {
  timeDuration.textContent = formatTime(bgMusic.duration);
});

// auto-advance to next song when one ends
bgMusic.addEventListener('ended', () => {
  const next = (currentTrack + 1) % SONGS.length;
  loadTrack(next, true);
});

progressBar.addEventListener('input', () => {
  if (bgMusic.duration) {
    bgMusic.currentTime = (progressBar.value / 100) * bgMusic.duration;
  }
});

// ── Controls ──
function togglePlay() {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying             = false;
    musicIcon.textContent    = '🎵';
    btnPlayPause.textContent = '▶';
    btnPlayPause.style.paddingLeft = '3px'; // optical center for play triangle
    musicBtn.classList.add('paused');
  } else {
    bgMusic.play().then(() => {
      musicPlaying             = true;
      musicIcon.textContent    = '🎵';
      btnPlayPause.textContent = '||';
      btnPlayPause.style.paddingLeft = '0px';
      musicBtn.classList.remove('paused');
    }).catch(() => {});
  }
}

btnPlayPause.addEventListener('click', togglePlay);
btnPrev.addEventListener('click', () => {
  const prev = (currentTrack - 1 + SONGS.length) % SONGS.length;
  loadTrack(prev, musicPlaying);
});
btnNext.addEventListener('click', () => {
  const next = (currentTrack + 1) % SONGS.length;
  loadTrack(next, musicPlaying);
});
btnRewind.addEventListener('click', () => { bgMusic.currentTime = Math.max(0, bgMusic.currentTime - 10); });
btnSkip.addEventListener('click',   () => { bgMusic.currentTime = Math.min(bgMusic.duration || 0, bgMusic.currentTime + 10); });

// ── Panel open/close ──
function openPanel() {
  holdTimer = null; // clear so mouseup/touchend doesn't also call togglePlay
  panelOpen = true;
  playerPanel.classList.add('open');
}
function closePanel() {
  panelOpen = false;
  playerPanel.classList.remove('open');
}

playerClose.addEventListener('click', closePanel);

// Click = play/pause; Hold (300ms) = open panel
musicBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  holdTimer = setTimeout(openPanel, 300);
});
musicBtn.addEventListener('touchstart', (e) => {
  holdTimer = setTimeout(openPanel, 300);
}, { passive: true });

musicBtn.addEventListener('mouseup', () => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
    togglePlay();
  }
});
musicBtn.addEventListener('touchend', () => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
    togglePlay();
  }
});
musicBtn.addEventListener('mouseleave', () => {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
});

// ── Autoplay on first numpad tap ──
function tryPlayMusic() {
  if (!musicPlaying) {
    bgMusic.play().then(() => {
      musicPlaying             = true;
      musicIcon.textContent    = '🎵';
      btnPlayPause.textContent = '⏸';
      btnPlayPause.style.paddingLeft = '0px';
      musicBtn.classList.remove('paused');
    }).catch(() => {});
  }
}

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

// ── Monthly reset: clears all photos at 12:00 noon on the 1st of each month ──
function checkMonthlyReset() {
  const now         = new Date();
  const year        = now.getFullYear();
  const month       = now.getMonth(); // 0-indexed

  // Build the reset timestamp for this month: 1st day, 12:00:00 midnight
  const resetTime   = new Date(year, month, 1, 0, 0, 0, 0);
  const resetKey    = `album_reset_${year}_${month}`;
  const alreadyDone = localStorage.getItem(resetKey);

  // If today is past the reset time AND we haven't reset for this month yet
  if (now >= resetTime && !alreadyDone) {
    for (let i = 0; i < 6; i++) {
      localStorage.removeItem('polaroid_' + i);
    }
    localStorage.setItem(resetKey, '1');
    console.log('Album reset for', year, month + 1);
  }
}
checkMonthlyReset();

// ── Schedule a check so if the page stays open past noon on the 1st, it still resets ──
function scheduleNextReset() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  // Next reset = 12 midnight on the 1st of next month
  const next  = new Date(year, month + 1, 1, 0, 0, 0, 0);
  const msUntil = next - now;

  setTimeout(() => {
    checkMonthlyReset();
    // Clear the UI too
    document.querySelectorAll('.polaroid').forEach(card => {
      const photo       = card.querySelector('.polaroid-photo');
      const placeholder = card.querySelector('.polaroid-placeholder');
      photo.src         = '';
      photo.classList.remove('loaded');
      placeholder.style.display = '';
      photo.style.zIndex        = '';
    });
    scheduleNextReset(); // reschedule for the month after
  }, msUntil);
}
scheduleNextReset();

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
