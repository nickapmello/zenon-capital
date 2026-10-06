// execution/cdp_audit_suite.js
// Script de auditoria automatizada via Chrome DevTools Protocol (CDP)
// Captura telas em 1440px, 768px, 390px, testa validação de formulário, resposta de API e confirmação de envio.

const fs = require('fs');
const path = require('path');
const http = require('http');

const ARTIFACT_DIR = 'C:/Users/Usuario/.gemini/antigravity-ide/brain/6ed7dcfd-19fa-4134-be31-b8e21cb0d01d';

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
    this.ws = new WebSocket(wsUrl);
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

async function runAudit() {
  console.log('=== Iniciando Suíte de Auditoria Visual & Funcional V5 ===');

  // Buscar aba existente
  const tabs = await getJson('http://127.0.0.1:9222/json/list');
  const pageTab = tabs.find(t => t.type === 'page');
  if (!pageTab) throw new Error('Nenhuma aba do tipo page encontrada.');
  console.log('Conectando à aba:', pageTab.id, pageTab.title);

  const client = new CDPClient(pageTab.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');

  async function setViewport(w, h, isMobile = false) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: isMobile
    });
    await sleep(400);
  }

  async function takeScreenshot(filename, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await client.send('Page.captureScreenshot', params);
    const buf = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`[Screenshot Salvo] ${filename} (${buf.length} bytes)`);
    return outPath;
  }

  async function evalJs(expr) {
    const res = await client.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result ? res.result.value : null;
  }

  // ==========================================
  // FASE 1: DESKTOP (1440x900)
  // ==========================================
  console.log('\n--- FASE 1: TESTES VISUAIS DESKTOP (1440x900) ---');
  await setViewport(1440, 900, false);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1500);

  // 1.1 Hero Desktop
  await takeScreenshot('audit_desktop_hero_1440px.png');

  // 1.2 Frentes de Atuação (com botão "Agendar diagnóstico")
  await evalJs("document.getElementById('stage-frentes').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(600);
  await takeScreenshot('audit_desktop_frentes_button_1440px.png');

  // 1.3 Selo de Discrição e Confidencialidade (Azul Limpo #172D44)
  await evalJs("document.getElementById('stage-principio').scrollIntoView({ behavior: 'instant', block: 'center' });");
  await sleep(600);
  await takeScreenshot('audit_desktop_seal_clean_1440px.png');

  // 1.4 Seção Contato com link da Política de Privacidade
  await evalJs("document.getElementById('stage-contato').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(600);
  await takeScreenshot('audit_desktop_contact_terms_link_1440px.png');

  // ==========================================
  // FASE 2: VALIDAÇÃO DE FORMULÁRIO (FRONTEND)
  // ==========================================
  console.log('\n--- FASE 2: TESTE DE VALIDAÇÃO DO FORMULÁRIO (CAMPOS VAZIOS) ---');
  // Submeter formulário vazio
  await evalJs("document.getElementById('submitBtn').click();");
  await sleep(600);
  await takeScreenshot('audit_desktop_form_validation_errors_1440px.png');

  // ==========================================
  // FASE 3: SUBMISSÃO VÁLIDA E CONFIRMAÇÃO DA API
  // ==========================================
  console.log('\n--- FASE 3: SUBMISSÃO REAL E CONFIRMAÇÃO DE RECEBIMENTO ---');
  await evalJs(`
    document.getElementById('nome').value = 'Auditoria Executiva V5';
    document.getElementById('email').value = 'contato@zenoncapital.com.br';
    document.getElementById('telefone').value = '(44) 99944-6650';
    document.getElementById('assunto').value = 'diagnostico';
    document.getElementById('mensagem').value = 'Mensagem de auditoria oficial para confirmacao de recebimento da proposta v5.';
  `);
  await sleep(300);
  // Submeter com dados preenchidos
  await evalJs("document.getElementById('submitBtn').click();");
  await sleep(2500); // aguarda resposta assíncrona da API e animação do banner
  await takeScreenshot('audit_desktop_form_submission_success_1440px.png');

  // ==========================================
  // FASE 4: PÁGINA DE PRIVACIDADE DESKTOP (1440px)
  // ==========================================
  console.log('\n--- FASE 4: PÁGINA DE PRIVACIDADE DESKTOP ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/privacidade' });
  await sleep(1200);
  await takeScreenshot('audit_desktop_privacy_header_1440px.png');

  await evalJs("window.scrollBy(0, 700);");
  await sleep(500);
  await takeScreenshot('audit_desktop_privacy_fields_infra_1440px.png');

  // ==========================================
  // FASE 5: TABLET (768x1024)
  // ==========================================
  console.log('\n--- FASE 5: TESTES TABLET (768x1024) ---');
  await setViewport(768, 1024, false);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1500);

  // 5.1 Hero Tablet
  await takeScreenshot('audit_tablet_hero_768px.png');

  // 5.2 Frentes Tablet
  await evalJs("document.getElementById('stage-frentes').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(600);
  await takeScreenshot('audit_tablet_frentes_768px.png');

  // 5.3 Selo Tablet
  await evalJs("document.getElementById('stage-principio').scrollIntoView({ behavior: 'instant', block: 'center' });");
  await sleep(600);
  await takeScreenshot('audit_tablet_seal_768px.png');

  // 5.4 Privacidade Tablet
  await client.send('Page.navigate', { url: 'http://localhost:3000/privacidade' });
  await sleep(1200);
  await takeScreenshot('audit_tablet_privacy_768px.png');

  // ==========================================
  // FASE 6: MOBILE (390x844)
  // ==========================================
  console.log('\n--- FASE 6: TESTES MOBILE (390x844) ---');
  await setViewport(390, 844, true);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1500);

  // 6.1 Hero Mobile
  await takeScreenshot('audit_mobile_hero_390px.png');

  // 6.2 Frentes Mobile
  await evalJs("document.getElementById('stage-frentes').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(600);
  await takeScreenshot('audit_mobile_frentes_button_390px.png');

  // 6.3 Selo Mobile
  await evalJs("document.getElementById('stage-principio').scrollIntoView({ behavior: 'instant', block: 'center' });");
  await sleep(600);
  await takeScreenshot('audit_mobile_seal_390px.png');

  // 6.4 Formulário Mobile
  await evalJs("document.getElementById('stage-contato').scrollIntoView({ behavior: 'instant', block: 'start' });");
  await sleep(600);
  await takeScreenshot('audit_mobile_contact_form_390px.png');

  // 6.5 Privacidade Mobile
  await client.send('Page.navigate', { url: 'http://localhost:3000/privacidade' });
  await sleep(1200);
  await takeScreenshot('audit_mobile_privacy_390px.png');

  console.log('\n=== Auditoria Concluída com Sucesso Total! ===');
  client.close();
}

runAudit().catch(err => {
  console.error('Erro na auditoria:', err);
  process.exit(1);
});
