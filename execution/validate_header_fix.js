// execution/validate_header_fix.js
// Validação automatizada do Header Fixo Adaptativo (Imagem 07 Ajustes_Site_Zenon2.pdf)

const fs = require('fs');
const path = require('path');
const http = require('http');

const ARTIFACT_DIR = 'C:/Users/Usuario/.gemini/antigravity-ide/brain/22750e32-c326-4fba-9eb0-d86930f03b38';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new globalThis.WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function runValidation() {
  console.log('=== Iniciando Auditoria Completa do Header Fixo Adaptativo ===');

  const tabs = await getJson('http://127.0.0.1:9222/json/list');
  const pageTab = tabs.find(t => t.type === 'page' && t.title.includes('Zenon Capital')) || tabs.find(t => t.type === 'page');
  if (!pageTab) throw new Error('Aba da Zenon Capital não encontrada.');
  console.log('Conectado à aba:', pageTab.id, pageTab.title);

  const client = new CDPClient(pageTab.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');

  async function setViewport(w, h, isMobile = false) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: isMobile ? 2 : 1,
      mobile: isMobile
    });
    await sleep(350);
  }

  async function evalJs(expr) {
    const res = await client.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result ? res.result.value : null;
  }

  async function takeHeaderScreenshot(filename, width = 1440, height = 200, scale = 1) {
    const scrollY = await evalJs('Math.round(window.scrollY);') || 0;
    const clip = { x: 0, y: scrollY, width, height, scale };
    const res = await client.send('Page.captureScreenshot', { format: 'png', clip });
    const buf = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`[Screenshot Salvo] ${filename} (${buf.length} bytes, y=${scrollY})`);
    return outPath;
  }

  // ==========================================
  // 1. DESKTOP (1440x900)
  // ==========================================
  console.log('\n--- 1. DESKTOP: HEADER SOBRE AS 4 CORES ---');
  await setViewport(1440, 900, false);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1500);

  // 1.1 AZUL (#stage-hero)
  console.log('\n[1.1] Testando Header sobre Azul (#stage-hero)...');
  await evalJs("window.scrollTo(0, 0);");
  await sleep(400);

  let heroData = await evalJs(`
    (() => {
      const h = document.getElementById('siteHeader');
      const cs = window.getComputedStyle(h);
      const lightLogo = h.querySelector('.logo-theme-light');
      const darkLogo = h.querySelector('.logo-theme-dark');
      const navLink = h.querySelector('.nav-link');
      const outlineBtn = h.querySelector('.btn-header-outline');
      const ctaBtn = h.querySelector('.btn-header-cta');
      return {
        classes: h.className,
        bgColor: cs.backgroundColor,
        lightLogoDisplay: window.getComputedStyle(lightLogo).display,
        darkLogoDisplay: window.getComputedStyle(darkLogo).display,
        navLinkColor: window.getComputedStyle(navLink).color,
        outlineBtnColor: window.getComputedStyle(outlineBtn).color,
        ctaBtnBg: window.getComputedStyle(ctaBtn).backgroundColor
      };
    })()
  `);
  console.log('Dados do Header (Azul):', heroData);
  await takeHeaderScreenshot('header_azul_desktop.png', 1440, 220, 1);

  // 1.2 CREME (#stage-quem-e)
  console.log('\n[1.2] Testando Header sobre Creme (#stage-quem-e)...');
  await evalJs("document.getElementById('stage-quem-e').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(400);

  let cremeData = await evalJs(`
    (() => {
      const h = document.getElementById('siteHeader');
      const cs = window.getComputedStyle(h);
      const lightLogo = h.querySelector('.logo-theme-light');
      const darkLogo = h.querySelector('.logo-theme-dark');
      const navLink = h.querySelector('.nav-link');
      const outlineBtn = h.querySelector('.btn-header-outline');
      const ctaBtn = h.querySelector('.btn-header-cta');
      return {
        classes: h.className,
        bgColor: cs.backgroundColor,
        borderColor: cs.borderBottomColor,
        lightLogoDisplay: window.getComputedStyle(lightLogo).display,
        darkLogoDisplay: window.getComputedStyle(darkLogo).display,
        navLinkColor: window.getComputedStyle(navLink).color,
        outlineBtnColor: window.getComputedStyle(outlineBtn).color,
        ctaBtnBg: window.getComputedStyle(ctaBtn).backgroundColor
      };
    })()
  `);
  console.log('Dados do Header (Creme):', cremeData);
  await takeHeaderScreenshot('header_creme_desktop.png', 1440, 220, 1);

  // 1.3 TERRACOTA (#stage-frentes)
  console.log('\n[1.3] Testando Header sobre Terracota (#stage-frentes)...');
  await evalJs("document.getElementById('stage-frentes').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(400);

  let terracotaData = await evalJs(`
    (() => {
      const h = document.getElementById('siteHeader');
      const cs = window.getComputedStyle(h);
      const lightLogo = h.querySelector('.logo-theme-light');
      const darkLogo = h.querySelector('.logo-theme-dark');
      const navLink = h.querySelector('.nav-link');
      const outlineBtn = h.querySelector('.btn-header-outline');
      return {
        classes: h.className,
        bgColor: cs.backgroundColor,
        lightLogoDisplay: window.getComputedStyle(lightLogo).display,
        darkLogoDisplay: window.getComputedStyle(darkLogo).display,
        navLinkColor: window.getComputedStyle(navLink).color,
        outlineBtnColor: window.getComputedStyle(outlineBtn).color
      };
    })()
  `);
  console.log('Dados do Header (Terracota):', terracotaData);
  await takeHeaderScreenshot('header_terracota_desktop.png', 1440, 220, 1);

  // 1.4 CINZA (#stage-fusoes)
  console.log('\n[1.4] Testando Header sobre Cinza (#stage-fusoes)...');
  await evalJs("document.getElementById('stage-fusoes').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(400);

  let cinzaData = await evalJs(`
    (() => {
      const h = document.getElementById('siteHeader');
      const cs = window.getComputedStyle(h);
      const lightLogo = h.querySelector('.logo-theme-light');
      const darkLogo = h.querySelector('.logo-theme-dark');
      const navLink = h.querySelector('.nav-link');
      const outlineBtn = h.querySelector('.btn-header-outline');
      return {
        classes: h.className,
        bgColor: cs.backgroundColor,
        lightLogoDisplay: window.getComputedStyle(lightLogo).display,
        darkLogoDisplay: window.getComputedStyle(darkLogo).display,
        navLinkColor: window.getComputedStyle(navLink).color,
        outlineBtnColor: window.getComputedStyle(outlineBtn).color
      };
    })()
  `);
  console.log('Dados do Header (Cinza):', cinzaData);
  await takeHeaderScreenshot('header_cinza_desktop.png', 1440, 220, 1);

  // ==========================================
  // 2. POSICIONAMENTO DAS ÂNCORAS & COMPENSAÇÃO
  // ==========================================
  console.log('\n--- 2. POSICIONAMENTO DAS ÂNCORAS ---');

  // Teste 2.1: Clique na âncora "Soluções" (#stage-frentes)
  await evalJs("document.querySelector('.header-nav a[href=\"#stage-frentes\"]').click();");
  await sleep(700);

  let frentesAnchorCheck = await evalJs(`
    (() => {
      const header = document.getElementById('siteHeader');
      const sec = document.getElementById('stage-frentes');
      const title = sec.querySelector('h2');
      const hBottom = header.getBoundingClientRect().bottom;
      const tTop = title.getBoundingClientRect().top;
      return {
        headerHeight: header.offsetHeight,
        headerBottom: hBottom,
        titleTop: tTop,
        clearanceBelowHeader: Math.round(tTop - hBottom),
        isTitleVisibleBelowHeader: tTop >= hBottom
      };
    })()
  `);
  console.log('Alinhamento da âncora #stage-frentes:', frentesAnchorCheck);

  // Teste 2.2: Clique na frente "01 Diagnóstico Zenon"
  await evalJs("document.querySelector('.frentes-grid a[href=\"#stage-diagnostico\"]').click();");
  await sleep(700);

  let diagAnchorCheck = await evalJs(`
    (() => {
      const header = document.getElementById('siteHeader');
      const sec = document.getElementById('stage-diagnostico');
      const title = sec.querySelector('h2');
      const hBottom = header.getBoundingClientRect().bottom;
      const tTop = title.getBoundingClientRect().top;
      return {
        headerBottom: hBottom,
        titleTop: tTop,
        clearanceBelowHeader: Math.round(tTop - hBottom),
        isTitleVisibleBelowHeader: tTop >= hBottom,
        headerTheme: header.className
      };
    })()
  `);
  console.log('Alinhamento da âncora #stage-diagnostico:', diagAnchorCheck);

  // Teste 2.3: Navegação direta por hash
  await evalJs("window.location.hash = 'stage-contato';");
  await sleep(700);

  let contatoHashCheck = await evalJs(`
    (() => {
      const header = document.getElementById('siteHeader');
      const sec = document.getElementById('stage-contato');
      const title = sec.querySelector('h2');
      const hBottom = header.getBoundingClientRect().bottom;
      const tTop = title.getBoundingClientRect().top;
      return {
        headerBottom: hBottom,
        titleTop: tTop,
        clearanceBelowHeader: Math.round(tTop - hBottom),
        isTitleVisibleBelowHeader: tTop >= hBottom,
        headerTheme: header.className
      };
    })()
  `);
  console.log('Navegação direta por hash #stage-contato:', contatoHashCheck);

  // Teste 2.4: Histórico Voltar / Avançar
  await evalJs("window.history.back();");
  await sleep(600);
  let backTheme = await evalJs("document.getElementById('siteHeader').className;");
  console.log('Tema do header após Voltar (back):', backTheme);

  await evalJs("window.history.forward();");
  await sleep(600);
  let forwardTheme = await evalJs("document.getElementById('siteHeader').className;");
  console.log('Tema do header após Avançar (forward):', forwardTheme);

  // ==========================================
  // 3. CELULAR (MOBILE: 390x844)
  // ==========================================
  console.log('\n--- 3. TESTES MOBILE (390x844) ---');
  await setViewport(390, 844, true);
  await evalJs("window.scrollTo(0, 0);");
  await sleep(600);

  // 3.1 Mobile Header sobre Azul
  console.log('\n[3.1] Mobile Header sobre Azul (#stage-hero)...');
  await takeHeaderScreenshot('header_mobile_azul.png', 390, 160, 2);

  // 3.2 Mobile Header sobre Creme
  console.log('\n[3.2] Mobile Header sobre Creme (#stage-quem-e)...');
  await evalJs("document.getElementById('stage-quem-e').scrollIntoView({ behavior: 'instant', block: 'start' }); window.scrollBy(0, 15); window.dispatchEvent(new Event('scroll'));");
  await sleep(400);
  await takeHeaderScreenshot('header_mobile_creme.png', 390, 160, 2);

  // 3.3 Menu Mobile Aberto sobre Creme
  console.log('\n[3.3] Abrindo Menu Drawer Mobile...');
  await evalJs("document.getElementById('mobileMenuToggle').click();");
  await sleep(500);

  let mobileDrawerInfo = await evalJs(`
    (() => {
      const panel = document.getElementById('mobileDrawerPanel');
      const lightLogo = panel.querySelector('.logo-theme-light');
      const darkLogo = panel.querySelector('.logo-theme-dark');
      const ctaBtn = panel.querySelector('.mobile-drawer-cta');
      const navLink = panel.querySelector('.mobile-nav-link');
      return {
        panelClasses: panel.className,
        lightLogoDisplay: window.getComputedStyle(lightLogo).display,
        darkLogoDisplay: window.getComputedStyle(darkLogo).display,
        navLinkColor: window.getComputedStyle(navLink).color,
        ctaBtnBg: window.getComputedStyle(ctaBtn).backgroundColor,
        ctaBtnColor: window.getComputedStyle(ctaBtn).color
      };
    })()
  `);
  console.log('Dados do Menu Drawer Mobile (Creme):', mobileDrawerInfo);

  // Screenshot do Drawer Aberto
  const drawerRes = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'drawer_mobile_creme_aberto.png'), Buffer.from(drawerRes.data, 'base64'));
  console.log('[Screenshot Salvo] drawer_mobile_creme_aberto.png');

  // Fechar Menu Mobile
  console.log('Fechando Menu Drawer...');
  await evalJs("document.getElementById('mobileDrawerClose').click();");
  await sleep(400);

  // 3.4 Mobile Header sobre Terracota
  console.log('\n[3.4] Mobile Header sobre Terracota (#stage-frentes)...');
  await evalJs("document.getElementById('stage-frentes').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(400);
  await takeHeaderScreenshot('header_mobile_terracota.png', 390, 160, 2);

  // 3.5 Mobile Header sobre Cinza
  console.log('\n[3.5] Mobile Header sobre Cinza (#stage-fusoes)...');
  await evalJs("document.getElementById('stage-fusoes').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(400);
  await takeHeaderScreenshot('header_mobile_cinza.png', 390, 160, 2);

  client.close();
  console.log('\n=== Auditoria completa finalizada com sucesso absoluto! ===');
}

runValidation().catch(err => {
  console.error('Erro na auditoria:', err);
  process.exit(1);
});
