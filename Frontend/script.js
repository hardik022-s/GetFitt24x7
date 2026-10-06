/* =========================================================
   EliteFit24x7 — Scripts
   ========================================================= */

/* ---------- Backend API ---------- */
// Change this one line when the backend is deployed.
const API_BASE = "https://elitefit24x7.onrender.com";

const FIELD_LABELS = {
  full_name: 'Name', name: 'Name', phone: 'Phone', email: 'Email',
  preferred_time: 'Preferred time', primary_goal: 'Goal', message: 'Message',
};

function formatErrors(body) {
  const lines = Object.entries(body).map(([field, msgs]) => {
    const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
    return `${FIELD_LABELS[field] || field}: ${text}`;
  });
  return lines.join(' • ') || 'Please check your details and try again.';
}

async function postJSON(path, data) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Can't reach the server. Please check your connection and try again.");
  }
  const body = await res.json().catch(() => ({}));
  if (res.ok) return body;
  if (res.status === 429) throw new Error('Too many attempts. Please wait a minute and try again.');
  if (res.status === 400) throw new Error(formatErrors(body));
  throw new Error('Something went wrong on our side. Please try again later.');
}

function setBusy(btn, busy, label) {
  if (busy) {
    btn.dataset.html = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = label;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.html;
  }
}   

document.addEventListener('DOMContentLoaded', () => {

  const NAV_OFFSET = 90;

  /* ---------- Smooth scroll to a section ---------- */
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    closeMobileMenu();
    dropdown.classList.remove('open');
  }

  // Any element with data-scroll="section-id" scrolls there on click
  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection(el.dataset.scroll);
    });
  });


  /* ---------- Navbar background on scroll ---------- */
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 25);
  }


  /* ---------- Home dropdown (desktop) ---------- */
  const dropdown = document.querySelector('.nav-dropdown');
  dropdown.addEventListener('mouseenter', () => dropdown.classList.add('open'));
  dropdown.addEventListener('mouseleave', () => dropdown.classList.remove('open'));


  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileHomeToggle = document.getElementById('mobileHomeToggle');
  const mobileSub = document.getElementById('mobileSub');

  // index for the staggered link animation
  mobileMenu.querySelectorAll('.stagger').forEach((item, i) => item.style.setProperty('--i', i));

  function openMobileMenu() {
    mobileMenu.style.setProperty('--menu-top', navbar.offsetHeight + 'px');
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });

  mobileHomeToggle.addEventListener('click', () => {
    mobileSub.classList.toggle('open');
    mobileHomeToggle.classList.toggle('expanded');
  });


  /* ---------- Scroll-spy (highlight active nav link) ---------- */
  const spyLinks = document.querySelectorAll('[data-spy]');
  const sectionIds = ['home', 'free-trial', 'about', 'trainers', 'gallery', 'membership', 'contact'];

  function setActive(id) {
    spyLinks.forEach((link) => link.classList.toggle('active', link.dataset.spy === id));
  }

  function updateScrollSpy() {
    // Map card gets priority when it's on screen
    const map = document.getElementById('map');
    const rect = map.getBoundingClientRect();
    if (rect.top <= 300 && rect.bottom >= 100) {
      setActive('map');
      return;
    }

    const pos = window.scrollY + 200;
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (pos >= top && pos < top + el.offsetHeight) {
        setActive(id);
        break;
      }
    }
  }

  function onScroll() {
    updateNavbar();
    updateScrollSpy();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ---------- Count-up helper ---------- */
  function countUp(target, duration, step, render) {
    let current = 0;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        render(target);
        clearInterval(timer);
      } else {
        render(Math.floor(current));
      }
    }, step);
  }

  // Hero "1.2k Happy Clients" — runs on page load
  const clientCount = document.getElementById('clientCount');
  countUp(1200, 1600, 16, (n) => {
    clientCount.textContent = (n / 1000).toFixed(1) + 'k';
  });

  // About stats — run when they scroll into view
  const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countUp(Number(el.dataset.target), 1800, 20, (n) => {
        el.textContent = n.toLocaleString();
      });
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach((el) => statObserver.observe(el));


  /* ---------- Scroll reveal animations ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


  /* ---------- Free trial form ---------- */
  const trialForm = document.getElementById('trialForm');
  const trialSuccess = document.getElementById('trialSuccess');

  trialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('trialName').value.trim();
    const phone = document.getElementById('trialPhone').value.trim();
    if (!name || !phone) return;

    const code = 'FIT-' + Math.floor(1000 + Math.random() * 9000);

    document.getElementById('passCode').textContent = code;
    document.getElementById('passCode2').textContent = code;
    document.getElementById('trialOutName').textContent = name;
    document.getElementById('trialOutTime').textContent = document.getElementById('trialTime').value;
    document.getElementById('trialOutGoal').textContent = document.getElementById('trialGoal').value;

    trialForm.hidden = true;
    trialSuccess.hidden = false;
  });

  document.getElementById('trialReset').addEventListener('click', () => {
    document.getElementById('trialName').value = '';
    document.getElementById('trialPhone').value = '';
    document.getElementById('trialEmail').value = '';
    trialSuccess.hidden = true;
    trialForm.hidden = false;
  });


  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    if (!name || !email || !message) return;

    document.getElementById('contactOutName').textContent = name;
    document.getElementById('contactOutEmail').textContent = email;

    contactForm.hidden = true;
    contactSuccess.hidden = false;
  });

  document.getElementById('contactReset').addEventListener('click', () => {
    document.getElementById('contactMessage').value = '';
    contactSuccess.hidden = true;
    contactForm.hidden = false;
  });


  /* ---------- Membership monthly / yearly toggle ---------- */
  const billingSwitch = document.getElementById('billingSwitch');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelYearly = document.getElementById('labelYearly');
  const prices = document.querySelectorAll('.price');
  const notes = document.querySelectorAll('.billing-note');
  let isYearly = false;

  function setBilling(yearly) {
    if (yearly === isYearly) return;
    isYearly = yearly;

    billingSwitch.classList.toggle('on', yearly);
    billingSwitch.setAttribute('aria-pressed', String(yearly));
    labelMonthly.classList.toggle('active', !yearly);
    labelYearly.classList.toggle('active', yearly);

    notes.forEach((n) => {
      n.textContent = yearly ? 'Billed annually (12 months)' : 'Billed month-to-month';
    });

    // old price slides down and out, new one drops in from above
    prices.forEach((price) => {
      price.classList.add('out');
      setTimeout(() => {
        const value = Number(yearly ? price.dataset.yearly : price.dataset.monthly);
        price.textContent = value.toLocaleString('en-IN');
        price.classList.remove('out');
        price.classList.add('in-start');
        void price.offsetWidth; // restart transition
        price.classList.remove('in-start');
      }, 200);
    });
  }

  billingSwitch.addEventListener('click', () => setBilling(!isYearly));
  labelMonthly.addEventListener('click', () => setBilling(false));
  labelYearly.addEventListener('click', () => setBilling(true));


  /* ---------- Gallery lightbox ---------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCategory = document.getElementById('lbCategory');
  const lbTitle = document.getElementById('lbTitle');
  const lbCounter = document.getElementById('lbCounter');
  let currentIndex = null;

  function showImage(index) {
    const item = galleryItems[index];
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCategory.textContent = item.dataset.category;
    lbTitle.textContent = item.dataset.title;
    lbCounter.textContent = `${index + 1} / ${galleryItems.length}`;
    currentIndex = index;
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    currentIndex = null;
  }

  const nextImage = () => showImage((currentIndex + 1) % galleryItems.length);
  const prevImage = () => showImage((currentIndex - 1 + galleryItems.length) % galleryItems.length);

  galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbNext').addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
  document.getElementById('lbPrev').addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  document.getElementById('lbBox').addEventListener('click', (e) => e.stopPropagation());
  lightbox.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (currentIndex === null) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });


  /* ---------- Footer ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('toTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
