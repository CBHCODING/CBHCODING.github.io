/* ================================
   CIERRA HILL PORTFOLIO — script.js
   Vanilla JS — no jQuery, no external libs
   ================================ */

/* --------------------------------
   Custom Cursor (desktop only)
   -------------------------------- */
if (window.matchMedia('(pointer: fine)').matches) {
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.querySelectorAll('a, button, .work-card, .filter-btn, .nav-logo').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  (function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();
}

/* --------------------------------
   Navbar — scroll + mobile toggle
   -------------------------------- */
const nav              = document.getElementById('nav');
const navToggle        = document.getElementById('navToggle');
const navLinksContainer = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  setActiveNavLink();
}, { passive: true });

navToggle.addEventListener('click', () => {
  navLinksContainer.classList.toggle('open');
});

// Smooth scroll
document.querySelectorAll('.nav-link, .nav-logo').forEach(el => {
  el.addEventListener('click', e => {
    const href = el.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = href === '#' ? null : document.querySelector(href);
    const top    = target
      ? target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight
      : 0;
    window.scrollTo({ top, behavior: 'smooth' });
    navLinksContainer.classList.remove('open');
  });
});

function setActiveNavLink() {
  const scrollY    = window.scrollY + nav.offsetHeight + 10;
  const sections   = ['about', 'skills', 'work', 'contact'];
  const homeLink   = document.querySelector('.nav-link[href="#"]');
  const aboutTop   = document.getElementById('about')?.offsetTop ?? Infinity;

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // If at (or near) the bottom of the page, always highlight Contact
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80;
  if (atBottom) {
    document.querySelector('.nav-link[href="#contact"]')?.classList.add('active');
    return;
  }

  if (scrollY < aboutTop) {
    homeLink?.classList.add('active');
    return;
  }

  let current = null;
  sections.forEach(id => {
    const sec = document.getElementById(id);
    if (sec && scrollY >= sec.offsetTop) current = id;
  });

  if (current) {
    const activeLink = document.querySelector(`.nav-link[href="#${current}"]`);
    activeLink?.classList.add('active');
  }
}

setActiveNavLink();

/* --------------------------------
   Typed Text — hero subtitle
   -------------------------------- */
const typedEl  = document.getElementById('typed');
const phrases  = ['Front-End Developer.', 'Gaming Content Creator.', 'Visionary.'];
let pIdx = 0, cIdx = 0, deleting = false;

function typeLoop() {
  if (!typedEl) return;
  const phrase = phrases[pIdx];
  const speed  = deleting ? 38 : 78;

  typedEl.textContent = deleting
    ? phrase.substring(0, cIdx - 1)
    : phrase.substring(0, cIdx + 1);

  deleting ? cIdx-- : cIdx++;

  if (!deleting && cIdx === phrase.length) {
    setTimeout(() => { deleting = true; typeLoop(); }, 2000);
    return;
  }
  if (deleting && cIdx === 0) {
    deleting = false;
    pIdx = (pIdx + 1) % phrases.length;
  }
  setTimeout(typeLoop, speed);
}

// Start after hero intro animation completes
setTimeout(typeLoop, 1900);

/* --------------------------------
   IntersectionObserver — section labels + reveal-up
   -------------------------------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-up, .section-label').forEach(el => revealObs.observe(el));

/* --------------------------------
   Work cards — clip-path reveal
   Checks on scroll + runs immediately on load
   -------------------------------- */
function revealCards() {
  document.querySelectorAll('.work-card:not(.hidden)').forEach(card => {
    if (card.classList.contains('visible')) return;
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
      card.classList.add('visible');
    }
  });
}

// Run on scroll (passive for performance)
window.addEventListener('scroll', revealCards, { passive: true });

// Run on load — small delay so layout is painted
setTimeout(revealCards, 100);

/* --------------------------------
   Count-up animation — about stats
   -------------------------------- */
const statsObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-number').forEach(el => {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const fps      = 60;
      const total    = duration / (1000 / fps);
      let frame      = 0;

      const tick = () => {
        frame++;
        // Ease-out: fast start, slow end
        const progress = 1 - Math.pow(1 - frame / total, 3);
        el.textContent = Math.min(Math.round(target * progress), target);
        if (frame < total) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    statsObs.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) statsObs.observe(statsEl);

/* --------------------------------
   Work filter buttons
   -------------------------------- */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards  = document.querySelectorAll('.work-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    workCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
        // Reset clip-path so the reveal re-fires for newly shown cards
        if (!card.classList.contains('visible')) {
          card.classList.remove('visible');
        }
      } else {
        card.classList.add('hidden');
        card.classList.remove('visible');
      }
    });

    // Re-check which newly visible cards are in viewport
    setTimeout(revealCards, 20);
  });
});

/* --------------------------------
   Project Modal
   -------------------------------- */
const modal             = document.getElementById('projectModal');
const modalClose        = document.getElementById('modalClose');
const modalVideo        = document.getElementById('modalVideo');
const modalPlaceholder  = document.getElementById('modalVideoPlaceholder');
const modalTitle        = document.getElementById('modalTitle');
const modalDesc         = document.getElementById('modalDesc');
const modalTags         = document.getElementById('modalTags');
const modalCat          = document.getElementById('modalCategory');

function openModal(card) {
  const title = card.dataset.title    || '';
  const desc  = card.dataset.desc     || '';
  const tags  = (card.dataset.tags    || '').split(',').map(t => t.trim()).filter(Boolean);
  const video = card.dataset.video    || '';
  const cat   = card.dataset.category || '';

  // Populate info panel
  modalTitle.innerHTML  = title;
  modalDesc.textContent = desc;
  modalCat.textContent  = cat.charAt(0).toUpperCase() + cat.slice(1);
  modalTags.innerHTML   = tags.map(t => `<span class="modal-tag">${t}</span>`).join('');

  // Set video source
  if (video) {
    modalVideo.src = video;
    modalVideo.classList.add('has-src');
    modalPlaceholder.style.display = 'none';
  } else {
    modalVideo.removeAttribute('src');
    modalVideo.classList.remove('has-src');
    modalPlaceholder.style.display = 'flex';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  // Pause & reset video
  modalVideo.pause();
  modalVideo.removeAttribute('src');
  modalVideo.classList.remove('has-src');
  modalVideo.load();
}

// Open on card button click
document.querySelectorAll('.work-card-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    openModal(btn.closest('.work-card'));
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// Keyboard
document.addEventListener('keydown', e => {
  if (modal.classList.contains('open') && e.key === 'Escape') closeModal();
});

/* --------------------------------
   Netlify form — AJAX submit
   -------------------------------- */
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const successMsg = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitText = submitBtn.querySelector('.submit-text');
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';

    try {
      const res = await fetch('/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams(new FormData(form)).toString(),
      });

      if (res.ok) {
        form.reset();
        submitBtn.style.display = 'none';
        successMsg.classList.add('visible');
      } else {
        throw new Error('Non-ok response');
      }
    } catch {
      submitBtn.disabled = false;
      submitText.textContent = 'Send Message';
      alert('Something went wrong. Please email cierracodes@gmail.com directly.');
    }
  });
}
