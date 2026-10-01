/**
 * Zenon Capital — Configurações Globais do Projeto
 * Centraliza URLs institucionais e pontos de integração para evitar divergências.
 */

const ZENON_CONFIG = Object.freeze({
  portalUrl: 'https://app.zenoncapital.com.br/auth',
  contactEmail: 'contato@zenoncapital.com.br',
  phone: '(44) 3218-2300'
});

/**
 * Atualiza dinamicamente todos os links de portal marcados com [data-portal-link]
 * garantindo abertura segura em nova aba.
 */
function applyZenonConfig() {
  const portalLinks = document.querySelectorAll('a[data-portal-link]');
  portalLinks.forEach(link => {
    link.href = ZENON_CONFIG.portalUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyZenonConfig);
  } else {
    applyZenonConfig();
  }
}

if (typeof window !== 'undefined') {
  window.ZENON_CONFIG = ZENON_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZENON_CONFIG;
}
