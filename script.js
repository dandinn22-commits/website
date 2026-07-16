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
  let current = 0;
  let autoTimer;

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
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  nextBtn.addEventListener('click', () => { goTo(current + 1); stopAuto(); startAuto(); });
  prevBtn.addEventListener('click', () => { goTo(current - 1); stopAuto(); startAuto(); });

  const carousel = document.querySelector('.reviews-carousel');
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  goTo(0);
  startAuto();
})();
