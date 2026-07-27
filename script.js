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
    if (preloaderText && scrambleFrame < 20) {
      preloaderText.textContent = target.split('').map((c, i) =>
        scrambleFrame > i * 4 ? c : chars[Math.floor(Math.random() * chars.length)]
      ).join('');
      scrambleFrame++;
      requestAnimationFrame(scramble);
    }
  }
  if (preloaderText) scramble();
  if (preloaderFill) preloaderFill.classList.add('active');
  if (preloader) {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      if (typeof animateHero === 'function') animateHero();
      revealWhatsAppFloat();
      ScrollTrigger.refresh();
    }, 1200);
  }

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
      if (!Number.isFinite(target)) return;
      const isDecimal = el.dataset.decimal === 'true';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2, ease: 'power2.out', delay: 0.8,
        onUpdate: () => {
          el.textContent = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val);
        },
        onComplete: () => {
          el.textContent = isDecimal ? target.toFixed(1) : Math.floor(target);
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
  /* --- Phone Input Mask --- */
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);
      if (v.length > 10) {
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7, 11)}`;
      } else if (v.length > 6) {
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6, 10)}`;
      } else if (v.length > 2) {
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
      } else if (v.length > 0) {
        e.target.value = `(${v}`;
      } else {
        e.target.value = '';
      }
    });
  }

  /* --- Contact Form Validation & Real HTTP Submit --- */
  const form = document.getElementById('contact-form');
  if (form) {
    const statusMsg = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    function setError(elementId, containerSelector, errorText) {
      const el = document.getElementById(elementId);
      const container = el ? el.closest(containerSelector) : null;
      const errorSpan = document.getElementById(`error-${elementId}`);
      if (container) container.classList.add('has-error');
      if (el) {
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', `error-${elementId}`);
      }
      if (errorSpan) errorSpan.textContent = errorText;
    }

    function clearError(elementId, containerSelector) {
      const el = document.getElementById(elementId);
      const container = el ? el.closest(containerSelector) : null;
      const errorSpan = document.getElementById(`error-${elementId}`);
      if (container) container.classList.remove('has-error');
      if (el) {
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
      }
      if (errorSpan) errorSpan.textContent = '';
    }

    // Clear errors on user input
    ['name', 'email', 'phone', 'interest', 'message'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => clearError(id, '.form-group'));
        input.addEventListener('change', () => clearError(id, '.form-group'));
      }
    });

    const radios = form.querySelectorAll('input[name="clientType"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const fieldsetContainer = document.getElementById('fieldset-clientType');
        const errorSpan = document.getElementById('error-clientType');
        if (fieldsetContainer) fieldsetContainer.classList.remove('has-error');
        if (errorSpan) errorSpan.textContent = '';
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;
      let firstInvalid = null;

      // 1. Validate Name
      const nameVal = document.getElementById('name')?.value.trim() || '';
      if (!nameVal) {
        setError('name', '.form-group', 'Informe seu nome.');
        isValid = false;
        if (!firstInvalid) firstInvalid = document.getElementById('name');
      } else {
        clearError('name', '.form-group');
      }

      // 2. Validate Email
      const emailVal = document.getElementById('email')?.value.trim() || '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        setError('email', '.form-group', 'Digite um e-mail válido.');
        isValid = false;
        if (!firstInvalid) firstInvalid = document.getElementById('email');
      } else {
        clearError('email', '.form-group');
      }

      // 3. Validate Phone
      const phoneVal = document.getElementById('phone')?.value.replace(/\D/g, '') || '';
      if (!phoneVal || phoneVal.length < 10) {
        setError('phone', '.form-group', 'Informe um telefone válido.');
        isValid = false;
        if (!firstInvalid) firstInvalid = document.getElementById('phone');
      } else {
        clearError('phone', '.form-group');
      }

      // 4. Validate Service (Interest)
      const interestVal = document.getElementById('interest')?.value || '';
      if (!interestVal) {
        setError('interest', '.form-group', 'Selecione o serviço de interesse.');
        isValid = false;
        if (!firstInvalid) firstInvalid = document.getElementById('interest');
      } else {
        clearError('interest', '.form-group');
      }

      // 5. Validate Client Type (Radio)
      const clientTypeChecked = form.querySelector('input[name="clientType"]:checked');
      if (!clientTypeChecked) {
        const fieldsetContainer = document.getElementById('fieldset-clientType');
        const errorSpan = document.getElementById('error-clientType');
        if (fieldsetContainer) fieldsetContainer.classList.add('has-error');
        if (errorSpan) errorSpan.textContent = 'Selecione Pessoa Física ou Empresa.';
        isValid = false;
        if (!firstInvalid) firstInvalid = form.querySelector('input[name="clientType"]');
      } else {
        const fieldsetContainer = document.getElementById('fieldset-clientType');
        const errorSpan = document.getElementById('error-clientType');
        if (fieldsetContainer) fieldsetContainer.classList.remove('has-error');
        if (errorSpan) errorSpan.textContent = '';
      }

      // 6. Validate Message
      const messageVal = document.getElementById('message')?.value.trim() || '';
      if (!messageVal) {
        setError('message', '.form-field-full', 'Descreva brevemente como podemos ajudar.');
        isValid = false;
        if (!firstInvalid) firstInvalid = document.getElementById('message');
      } else {
        clearError('message', '.form-field-full');
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Clear previous status messages
      if (statusMsg) {
        statusMsg.className = 'form-status-msg';
        statusMsg.textContent = '';
      }

      const btnText = submitBtn ? submitBtn.querySelector('span') : null;
      const originalText = btnText ? btnText.textContent : 'Enviar mensagem';

      // Set loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
      }
      if (btnText) btnText.textContent = 'Enviando...';

      const formFields = form.querySelectorAll('input, select, textarea');
      formFields.forEach(field => field.disabled = true);

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        let result = null;
        try {
          result = await response.json();
        } catch (jsonErr) {
          // Response is non-JSON
        }

        if (!response.ok || (result && (result.success === 'false' || result.success === false))) {
          throw new Error('Falha no envio do formulário.');
        }

        if (statusMsg) {
          statusMsg.className = 'form-status-msg status-success';
          statusMsg.setAttribute('role', 'status');
          statusMsg.setAttribute('aria-live', 'polite');
          statusMsg.textContent = 'Mensagem enviada com sucesso. Nossa equipe entrará em contato em breve.';
        }
        form.reset();
      } catch (err) {
        console.error('Contact form submission error:', err.message);
        if (statusMsg) {
          statusMsg.className = 'form-status-msg status-error';
          statusMsg.setAttribute('role', 'alert');
          statusMsg.textContent = 'Não foi possível enviar sua mensagem agora. Tente novamente ou entre em contato pelo telefone ou e-mail informado nesta página.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-loading');
        }
        if (btnText) btnText.textContent = originalText;
        formFields.forEach(field => field.disabled = false);
      }
    });
  }

  /* --- Dynamic Footer Year --- */
  const currentYearElement = document.querySelector('#current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
});
