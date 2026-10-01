/**
 * Zenon Capital — Navegação Responsiva & Menu Mobile Acessível
 * Gerencia abertura, fechamento, armadilha de foco (focus trap), tecla Escape e acessibilidade WCAG.
 */

(function () {
  'use strict';

  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileDrawer');
    const closeBtn = document.getElementById('mobileDrawerClose');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    const panel = document.getElementById('mobileDrawerPanel');

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
        // Fecha o menu para navegar até a seção ou link externo sem reter o foco forçado
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
          // Shift + Tab voltando
          if (document.activeElement === firstElement || !panel.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab avançando
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
