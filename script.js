/* ========================================
   ZENON CAPITAL — Premium Animations (GSAP)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* --- Preloader --- */
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloader-text');
  const preloaderFill = document.querySelector('.preloader-fill');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const target = 'ZENON';
  let scrambleFrame = 0;

  function scramble() {
    if (scrambleFrame < 20) {
      preloaderText.textContent = target.split('').map((c, i) =>
        scrambleFrame > i * 4 ? c : chars[Math.floor(Math.random() * chars.length)]
      ).join('');
      scrambleFrame++;
      requestAnimationFrame(scramble);
    }
  }
  scramble();
  preloaderFill.classList.add('active');
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
    animateHero();
  }, 2000);
  document.body.style.overflow = 'hidden';

  /* --- Navbar Scroll --- */
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      navbar.classList.toggle('scrolled', self.progress > 0 || window.scrollY > 80);
    }
  });
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });

  /* --- Mobile Menu --- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* --- Hero Stagger Reveal --- */
  function animateHero() {
    gsap.to('.reveal-item', {
      opacity: 1, y: 0,
      duration: 1, stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2
    });
    gsap.from('.hero-img-wrap', {
      scale: 1.1, opacity: 0,
      duration: 1.4, ease: 'power3.out', delay: 0.4
    });
    gsap.from('.hero-float-card', {
      y: 40, opacity: 0,
      duration: 1, ease: 'power3.out', delay: 1
    });
    animateCounters();
  }

  /* --- Counter Animation --- */
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isDecimal = el.dataset.decimal === 'true';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2, ease: 'power2.out', delay: 1.2,
        onUpdate: () => {
          el.textContent = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val);
        }
      });
    });
  }

  /* --- Marquee --- */
  const marqueeTrack = document.getElementById('marquee-track');
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
    gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: 30,
      ease: 'none',
      repeat: -1
    });
  }

  /* --- About: Scrubbing Text Reveal --- */
  const scrubText = document.getElementById('scrub-text');
  if (scrubText) {
    const words = scrubText.textContent.trim().split(/\s+/);
    scrubText.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
    const wordEls = scrubText.querySelectorAll('.word');

    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        wordEls.forEach((word, i) => {
          const wordProgress = i / wordEls.length;
          word.classList.toggle('active', wordProgress < progress);
        });
      }
    });
  }

  /* --- Section Reveals --- */
  gsap.utils.toArray('.section-header, .section-label').forEach(el => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  /* --- Bento Cards Stagger --- */
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.from(card, {
      y: 50, opacity: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  /* --- Horizontal Scroll PJ --- */
  const hscrollTrack = document.getElementById('hscroll-track');
  const hscrollWrapper = document.getElementById('hscroll-wrapper');
  if (hscrollTrack && hscrollWrapper && window.innerWidth > 768) {
    const cards = hscrollTrack.querySelectorAll('.hscroll-card');
    const totalScroll = hscrollTrack.scrollWidth - window.innerWidth + 100;

    gsap.to(hscrollTrack, {
      x: -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: '#solutions-pj',
        start: 'top 20%',
        end: () => `+=${totalScroll}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, scale: 0.9, duration: 0.6, delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#solutions-pj', start: 'top 60%', toggleActions: 'play none none none' }
      });
    });
  }

  /* --- Team Reveal --- */
  const teamMembers = document.querySelectorAll('.team-member');
  const teamObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        teamObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  teamMembers.forEach(m => teamObserver.observe(m));

  /* --- CTA Banner Reveal --- */
  gsap.from('.cta-inner', {
    y: 50, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#cta-banner', start: 'top 75%', toggleActions: 'play none none none' }
  });

  /* --- Contact Reveal --- */
  gsap.from('.contact-info', {
    x: -40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 70%', toggleActions: 'play none none none' }
  });
  gsap.from('.contact-form', {
    x: 40, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.15,
    scrollTrigger: { trigger: '#contact', start: 'top 70%', toggleActions: 'play none none none' }
  });

  /* --- Spotlight Border Effect --- */
  document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
  });

  /* --- Magnetic Buttons --- */
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    });
  });

  /* --- Tilt Cards (Team) --- */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 10, rotateX: -y * 10,
        duration: 0.4, ease: 'power2.out',
        transformPerspective: 800
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.6)' });
    });
  });

  /* --- Hero Parallax on Scroll --- */
  gsap.to('.hero-img', {
    yPercent: 15,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });

  /* --- About Image Parallax --- */
  gsap.from('.about-img', {
    yPercent: 20, scale: 1.05,
    scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });

  /* --- Smooth Scroll for Anchor Links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* --- Form Submit --- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"] span');
      const originalText = btn.textContent;
      btn.textContent = 'Mensagem enviada';
      gsap.fromTo(form.querySelector('button'), { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1,0.5)' });
      setTimeout(() => { btn.textContent = originalText; form.reset(); }, 3000);
    });
  }

  /* --- Stack Cards Scale on Scroll --- */
  gsap.utils.toArray('.stack-card').forEach((card, i) => {
    gsap.from(card, {
      scale: 0.95, opacity: 0.5, duration: 0.6,
      scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' }
    });
  });
});
