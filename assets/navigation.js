/**
 * Zenon Capital — Navegação Responsiva & Header Adaptativo
 * - Header dinâmico com cor de fundo acompanhando a seção imediatamente abaixo dele
 * - Identificação estável da seção ativa na linha de prova da base do header
 * - Sincronização dinâmica de compensação de âncoras (--header-offset / scroll-padding-top)
 * - Menu mobile acessível (focus trap, ARIA, tema sincronizado)
 */

(function () {
  'use strict';

  // 1. SINCRONIZAÇÃO DA COMPENSAÇÃO DE ÂNCORAS (SCROLL PADDING TOP)
  function syncHeaderOffset() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const height = header.offsetHeight;
    if (height > 0) {
      document.documentElement.style.setProperty('--header-offset', height + 'px');
    }
  }

  // 2. HEADER DINÂMICO & IDENTIFICAÇÃO DA SEÇÃO ATIVA
  function initHeaderDynamicTheme() {
    const header = document.getElementById('siteHeader');
    const drawerPanel = document.getElementById('mobileDrawerPanel');
    if (!header) return;

    // Seções monitoradas com seus respectivos temas
    const sections = Array.from(document.querySelectorAll('[data-header-theme]'));
    if (sections.length === 0) return;

    const navLinks = Array.from(document.querySelectorAll('.header-nav .nav-link, .mobile-nav-link'));

    let ticking = false;
    let lastTheme = null;
    let lastActiveId = null;

    function evaluateCurrentSection() {
      ticking = false;
      const headerHeight = header.offsetHeight || 76;
      // Linha de prova posicionada imediatamente abaixo da base do header fixo
      const probeY = headerHeight + 2;

      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      let currentSection = null;

      // 1. Topo absoluto da página
      if (scrollY <= 10) {
        currentSection = sections[0];
      }
      // 2. Fim da página (rodapé visível)
      else if (scrollY + winHeight >= docHeight - 12) {
        currentSection = sections[sections.length - 1];
      }
      // 3. Prova da seção que intercepta a linha probeY
      else {
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const rect = sec.getBoundingClientRect();
          if (rect.top <= probeY && rect.bottom > probeY) {
            currentSection = sec;
            break;
          }
        }
      }

      // Fallback caso caia em borda de subpixel
      if (!currentSection) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const rect = sections[i].getBoundingClientRect();
          if (rect.top <= probeY) {
            currentSection = sections[i];
            break;
          }
        }
      }

      if (!currentSection) {
        currentSection = sections[0];
      }

      const theme = currentSection.getAttribute('data-header-theme') || 'azul';
      const sectionId = currentSection.id;

      // Atualiza tema do Header e do Drawer Mobile
      if (theme !== lastTheme) {
        header.classList.remove('header-theme-azul', 'header-theme-creme', 'header-theme-terracota', 'header-theme-cinza');
        header.classList.add('header-theme-' + theme);

        if (drawerPanel) {
          drawerPanel.classList.remove('drawer-theme-azul', 'drawer-theme-creme', 'drawer-theme-terracota', 'drawer-theme-cinza');
          drawerPanel.classList.add('drawer-theme-' + theme);
        }
        lastTheme = theme;
      }

      // Atualiza destaque da seção ativa nos menus
      if (sectionId && sectionId !== lastActiveId) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === '#' + sectionId) {
            link.classList.add('active');
          } else if (href && href.startsWith('#')) {
            link.classList.remove('active');
          }
        });
        lastActiveId = sectionId;
      }
    }

    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(evaluateCurrentSection);
      }
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', () => {
      syncHeaderOffset();
      onScrollOrResize();
    }, { passive: true });
    window.addEventListener('hashchange', () => {
      syncHeaderOffset();
      setTimeout(evaluateCurrentSection, 50);
    }, { passive: true });

    // Avaliação inicial
    syncHeaderOffset();
    evaluateCurrentSection();
  }

  // 3. MENU MOBILE ACESSÍVEL (WCAG, FOCUS TRAP, ESCAPE)
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileDrawer');
    const closeBtn = document.getElementById('mobileDrawerClose');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    const panel = document.getElementById('mobileDrawerPanel');
    const header = document.getElementById('siteHeader');

    if (!toggleBtn || !drawer) return;

    let isOpen = false;

    // Seletores de elementos focáveis para o focus trap
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    function getFocusableElements() {
      if (!panel) return [];
      return Array.from(panel.querySelectorAll(focusableSelectors)).filter(
        el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );
    }

    function openMenu() {
      if (isOpen) return;
      isOpen = true;

      // Sincroniza explicitamente o tema do drawer com o tema do header ativo
      if (panel && header) {
        const match = header.className.match(/header-theme-([a-z]+)/);
        const currentTheme = match ? match[1] : 'azul';
        panel.classList.remove('drawer-theme-azul', 'drawer-theme-creme', 'drawer-theme-terracota', 'drawer-theme-cinza');
        panel.classList.add('drawer-theme-' + currentTheme);
      }

      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Fechar menu de navegação');
      document.body.classList.add('mobile-nav-open');

      // Foca no botão de fechar ou no primeiro link após a transição
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        setTimeout(() => {
          (closeBtn || focusables[0]).focus();
        }, 120);
      }
    }

    function closeMenu(restoreFocus = true) {
      if (!isOpen) return;
      isOpen = false;

      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Abrir menu de navegação');
      document.body.classList.remove('mobile-nav-open');

      if (restoreFocus && toggleBtn) {
        toggleBtn.focus();
      }
    }

    // Toggle ao clicar no botão hambúrguer
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    // Botão de fechar dentro do drawer
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu(true);
      });
    }

    // Fechar ao clicar no backdrop (fora do painel)
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        closeMenu(true);
      });
    }

    // Fechar ao clicar em qualquer link de navegação do menu móvel
    const navLinks = drawer.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu(false);
      });
    });

    // Gerenciamento de teclado: Escape para fechar + Focus Trap acessível
    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        closeMenu(true);
        return;
      }

      if (e.key === 'Tab') {
        const focusables = getFocusableElements();
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !panel.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !panel.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });

    // Fechar automaticamente se a tela for redimensionada para desktop (> 768px)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && isOpen) {
          closeMenu(false);
        }
      }, 100);
    }, { passive: true });
  }

  // 4. INICIALIZAÇÃO
  function initAll() {
    syncHeaderOffset();
    initHeaderDynamicTheme();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
