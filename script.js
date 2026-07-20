/* ========================================
   ZENON CAPITAL — Premium Animations (GSAP)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* --- Preloader --- */
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloader-text');
  const preloaderFill = document.querySelector('.preloader-fill');
  const whatsappFloat = document.getElementById('whatsapp-float');
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
    revealWhatsAppFloat();
  }, 2000);
  document.body.style.overflow = 'hidden';

  function revealWhatsAppFloat() {
    if (!whatsappFloat) return;
    setTimeout(() => whatsappFloat.classList.add('is-visible'), 650);
  }

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
  function syncWhatsAppWithMobileMenu() {
    if (!whatsappFloat) return;
    whatsappFloat.classList.toggle('is-menu-hidden', mobileMenu.classList.contains('open'));
  }

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    syncWhatsAppWithMobileMenu();
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      syncWhatsAppWithMobileMenu();
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

  const marqueeMedia = gsap.matchMedia();

  marqueeMedia.add({
    isDesktop: "(min-width: 768px)",
    isMobile: "(max-width: 767px)"
  }, (context) => {
    let { isDesktop } = context.conditions;

    const tween = gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: isDesktop ? 30 : 4, 
      ease: 'none',
      repeat: -1
    });

    return () => tween.kill(); 
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
  if (hscrollTrack && hscrollWrapper) {
    const cards = hscrollTrack.querySelectorAll('.hscroll-card');
    const hscrollButtons = document.querySelectorAll('[data-hscroll-dir]');

    function updateHscrollButtons() {
      const maxScroll = hscrollWrapper.scrollWidth - hscrollWrapper.clientWidth;
      hscrollButtons.forEach((button) => {
        const direction = Number(button.dataset.hscrollDir);
        button.disabled = maxScroll <= 1 ||
          (direction < 0 && hscrollWrapper.scrollLeft <= 1) ||
          (direction > 0 && hscrollWrapper.scrollLeft >= maxScroll - 1);
      });
    }

    hscrollButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const firstCard = cards[0];
        const gap = parseFloat(getComputedStyle(hscrollTrack).gap) || 0;
        const scrollAmount = firstCard ? firstCard.offsetWidth + gap : hscrollWrapper.clientWidth;

        hscrollWrapper.scrollBy({
          left: Number(button.dataset.hscrollDir) * scrollAmount,
          behavior: 'smooth'
        });
      });
    });

    hscrollWrapper.addEventListener('scroll', updateHscrollButtons, { passive: true });
    window.addEventListener('resize', updateHscrollButtons);
    updateHscrollButtons();

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
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    });

    btn.addEventListener('touchend', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
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
        let navOffset = window.innerWidth <= 768 ? 60 : 80;
        
        if (href === '#contact-form') {
          navOffset = window.innerWidth <= 768 ? 150 : 100;
        }

        const y = target.getBoundingClientRect().top + window.scrollY - navOffset;
        
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* --- Phone Input Mask --- */
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  /* --- Form Submit & Loading --- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('span');
      const formFields = form.querySelectorAll('input, textarea');
      
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
      formFields.forEach(field => field.disabled = true);
      
      const originalText = btnText.textContent;
      btnText.textContent = 'Enviando...';

      setTimeout(() => {
        submitBtn.classList.remove('btn-loading');
        btnText.textContent = 'Mensagem enviada';
        gsap.fromTo(submitBtn, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1,0.5)' });
        
        form.reset();

        setTimeout(() => {
          btnText.textContent = originalText;
          formFields.forEach(field => field.disabled = false);
          submitBtn.disabled = false;
        }, 2000);
      }, 2000);
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
