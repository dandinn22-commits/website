// script.js
// שולח את פרטי כל טופס יצירת קשר בעמוד (יכול להיות יותר מאחד) לשרת, ומציג הודעת הצלחה/שגיאה בעברית.

document.querySelectorAll('.contact-form').forEach(function (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nameInput = form.querySelector('input[type="text"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const messageEl = form.querySelector('.form-message');
    const submitBtn = form.querySelector('.form-submit');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    // ולידציה פשוטה בצד הלקוח, לפני שליחה לשרת
    const phoneRegex = /^0\d{8,9}$/;
    if (name.length < 2) {
      showMessage(messageEl, 'נא להזין שם מלא תקין.', 'error');
      return;
    }
    if (!phoneRegex.test(phone)) {
      showMessage(messageEl, 'נא להזין מספר טלפון ישראלי תקין (לדוגמה: 0501234567).', 'error');
      return;
    }

    // מנטרל את הכפתור בזמן השליחה כדי למנוע שליחות כפולות
    submitBtn.disabled = true;
    submitBtn.textContent = 'שולח...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // הצלחה - מעבירים את המשתמש לדף תודה במקום להציג הודעה בתוך העמוד
        window.location.href = 'thanks.html';
        return;
      } else {
        showMessage(messageEl, data.message || 'משהו השתבש. נסו שוב.', 'error');
      }
    } catch (err) {
      showMessage(messageEl, 'בעיית תקשורת. בדקו את החיבור לאינטרנט ונסו שוב.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'שלחו ואחזור אליכם';
    }
  });
});

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = 'form-message ' + type;
}

// ===== קרוסלת ביקורות =====
(function () {
  const track = document.getElementById('reviews-track');
  if (!track) return;

  const slides = track.querySelectorAll('.review-page');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.querySelector('.carousel-arrow-prev');
  const nextBtn = document.querySelector('.carousel-arrow-next');
  const pauseBtn = document.getElementById('carouselPauseBtn');
  const pauseIcon = document.getElementById('carouselPauseIcon');
  const pauseLabel = document.getElementById('carouselPauseLabel');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let autoTimer;
  // נגישות: אם המשתמש ביקש "הפחתת תנועה" במערכת ההפעלה, הקרוסלה תתחיל במצב עצור
  let userPaused = prefersReducedMotion;

  // יוצר נקודת ניווט (dot) לכל ביקורת
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'ביקורת מספר ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    if (userPaused) return;
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  function updatePauseButton() {
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseIcon.textContent = userPaused ? '▶' : '⏸';
    pauseLabel.textContent = userPaused ? 'הפעלת החלפה אוטומטית' : 'עצירת החלפה אוטומטית';
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      updatePauseButton();
      if (userPaused) stopAuto(); else startAuto();
    });
    updatePauseButton();
  }

  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });

  const carousel = document.querySelector('.reviews-carousel');
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', startAuto);

  goTo(0);
  startAuto();
})();

// ===== ווידג'ט נגישות =====
(function () {
  const toggle = document.getElementById('a11yToggle');
  const panel = document.getElementById('a11yPanel');
  if (!toggle || !panel) return;

  const root = document.documentElement;
  const STORAGE_KEY = 'a11yPrefs';
  const MIN_STEP = -2;
  const MAX_STEP = 4;
  const state = Object.assign({ fontStep: 0, contrast: false, underline: false, stopAnim: false }, loadPrefs());

  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* אחסון לא זמין - מתעלמים */ }
  }

  function applyState() {
    root.style.fontSize = state.fontStep ? (100 + state.fontStep * 10) + '%' : '';
    root.classList.toggle('a11y-contrast', state.contrast);
    root.classList.toggle('a11y-underline', state.underline);
    root.classList.toggle('a11y-stop-anim', state.stopAnim);

    setPressed('contrast', state.contrast);
    setPressed('underline', state.underline);
    setPressed('stop-anim', state.stopAnim);
  }

  function setPressed(key, value) {
    const btn = panel.querySelector('[data-a11y="' + key + '"]');
    if (btn) btn.setAttribute('aria-pressed', String(!!value));
  }

  applyState();

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    if (panel.hidden) openPanel(); else closePanel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      closePanel();
      toggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle) {
      closePanel();
    }
  });

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-a11y]');
    if (!btn) return;
    const action = btn.dataset.a11y;

    if (action === 'font-inc') {
      state.fontStep = Math.min(MAX_STEP, state.fontStep + 1);
    } else if (action === 'font-dec') {
      state.fontStep = Math.max(MIN_STEP, state.fontStep - 1);
    } else if (action === 'contrast') {
      state.contrast = !state.contrast;
    } else if (action === 'underline') {
      state.underline = !state.underline;
    } else if (action === 'stop-anim') {
      state.stopAnim = !state.stopAnim;
    } else if (action === 'reset') {
      state.fontStep = 0;
      state.contrast = false;
      state.underline = false;
      state.stopAnim = false;
    }

    applyState();
    savePrefs();
  });
})();
