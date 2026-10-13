const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Usuario/.gemini/antigravity-ide/brain/624a7329-f035-442f-82c4-caba14839f40';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

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

async function run() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  console.log('Launching headless Chrome...');
  const tempDir = path.join(process.env.TEMP || 'C:/Temp', 'chrome_audit_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + tempDir,
    '--disable-gpu',
    '--no-first-run',
    'about:blank'
  ]);

  let connected = false;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      await getJson('http://127.0.0.1:9222/json/version');
      connected = true;
      break;
    } catch (e) {}
  }

  if (!connected) {
    chromeProc.kill();
    throw new Error('Could not connect to Chrome on port 9222');
  }

  console.log('Connected to Chrome. Creating target...');
  const list = await getJson('http://127.0.0.1:9222/json/list');
  let target = list.find(t => t.type === 'page');
  if (!target) {
    const newPage = await getJson('http://127.0.0.1:9222/json/new');
    target = newPage;
  }

  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  const viewports = [
    { name: '1366x768', width: 1366, height: 768, isMobile: false },
    { name: '1280x720', width: 1280, height: 720, isMobile: false },
    { name: '390x844', width: 390, height: 844, isMobile: true }
  ];

  const results = {};

  for (const vp of viewports) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.isMobile
    });

    results[vp.name] = {};

    // Helper: navigate and settle anchor scroll precisely
    async function goToAnchor(anchorId) {
      await client.send('Runtime.evaluate', {
        expression: `(() => {
          document.documentElement.style.scrollBehavior = 'auto';
          const header = document.getElementById('siteHeader');
          const el = document.getElementById('${anchorId}');
          if (el && header) {
            const headerHeight = header.offsetHeight;
            const targetY = Math.max(0, el.offsetTop - headerHeight);
            window.scrollTo(0, targetY);
            window.dispatchEvent(new Event('scroll'));
          }
        })()`
      });
      await sleep(250);
    }

    // Load page first
    await client.send('Page.navigate', { url: `http://localhost:3000` });
    await sleep(800);

    // 1. Test #stage-diagnostico
    await goToAnchor('stage-diagnostico');

    const diagData = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const header = document.getElementById('siteHeader');
        const section = document.getElementById('stage-diagnostico');
        const title = section.querySelector('.diagnostico-headline');
        const img = section.querySelector('.diagnostico-photo');
        const cta = section.querySelector('.diagnostico-btn');
        const headerRect = header.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const ctaRect = cta.getBoundingClientRect();
        
        return {
          headerTheme: Array.from(header.classList).find(c => c.startsWith('header-theme-')),
          headerBottom: Math.round(headerRect.bottom),
          sectionTop: Math.round(sectionRect.top),
          sectionHeight: Math.round(sectionRect.height),
          titleTop: Math.round(titleRect.top),
          titleVisibleBelowHeader: titleRect.top >= headerRect.bottom,
          titleClearancePx: Math.round(titleRect.top - headerRect.bottom),
          imgRendered: {
            width: Math.round(imgRect.width),
            height: Math.round(imgRect.height),
            aspectRatio: (imgRect.width / imgRect.height).toFixed(3),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            naturalAspect: (img.naturalWidth / img.naturalHeight).toFixed(3)
          },
          ctaVisible: ctaRect.top < window.innerHeight && ctaRect.bottom > 0,
          ctaBottomToViewport: Math.round(window.innerHeight - ctaRect.bottom),
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        };
      })()`,
      returnByValue: true
    });

    results[vp.name].diagnostico = diagData.result.value;
    console.log('Diagnóstico data:', JSON.stringify(diagData.result.value, null, 2));

    const shotDiag = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, `stage_diagnostico_${vp.name}.png`), Buffer.from(shotDiag.data, 'base64'));

    // 2. Test #stage-para-quem-e
    await goToAnchor('stage-para-quem-e');

    const paraQuemData = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const header = document.getElementById('siteHeader');
        const section = document.getElementById('stage-para-quem-e');
        const title = section.querySelector('.section-title-dark');
        const cards = Array.from(section.querySelectorAll('.arch-card'));
        const headerRect = header.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        const cardsRects = cards.map(c => {
          const r = c.getBoundingClientRect();
          return {
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            width: Math.round(r.width),
            height: Math.round(r.height)
          };
        });

        const uniqueTops = new Set(cardsRects.map(r => r.top)).size;
        const lastCardBottom = Math.max(...cardsRects.map(r => r.bottom));

        return {
          headerTheme: Array.from(header.classList).find(c => c.startsWith('header-theme-')),
          headerBottom: Math.round(headerRect.bottom),
          sectionTop: Math.round(sectionRect.top),
          sectionHeight: Math.round(sectionRect.height),
          titleTop: Math.round(titleRect.top),
          titleVisibleBelowHeader: titleRect.top >= headerRect.bottom,
          titleClearancePx: Math.round(titleRect.top - headerRect.bottom),
          cardsCount: cards.length,
          cardDimensions: cardsRects[0],
          uniqueRowTops: uniqueTops,
          allCardsVisibleInViewport: lastCardBottom <= window.innerHeight,
          lastCardBottomToViewport: Math.round(window.innerHeight - lastCardBottom),
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`,
      returnByValue: true
    });

    results[vp.name].paraQuemE = paraQuemData.result.value;
    console.log('Para Quem É data:', JSON.stringify(paraQuemData.result.value, null, 2));

    const shotParaQuem = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, `stage_para_quem_e_${vp.name}.png`), Buffer.from(shotParaQuem.data, 'base64'));

    // 3. Test #stage-principio
    await goToAnchor('stage-principio');

    const principioData = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const header = document.getElementById('siteHeader');
        const section = document.getElementById('stage-principio');
        const title = section.querySelector('.section-title-dark');
        const seal = section.querySelector('.principio-seal-img');
        const nextSection = document.getElementById('stage-por-que');
        
        const headerRect = header.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        const sealRect = seal.getBoundingClientRect();
        const nextRect = nextSection ? nextSection.getBoundingClientRect() : null;

        const visibleViewportHeight = window.innerHeight - headerRect.bottom;
        const fillsVisibleViewport = sectionRect.bottom >= (window.innerHeight - 1);
        const nextSectionVisibleAtArrival = nextRect ? nextRect.top < window.innerHeight : false;

        return {
          headerTheme: Array.from(header.classList).find(c => c.startsWith('header-theme-')),
          headerBottom: Math.round(headerRect.bottom),
          sectionTop: Math.round(sectionRect.top),
          sectionBottom: Math.round(sectionRect.bottom),
          sectionHeight: Math.round(sectionRect.height),
          visibleViewportHeight: Math.round(visibleViewportHeight),
          fillsVisibleViewport: fillsVisibleViewport,
          nextSectionPeeksIn: nextSectionVisibleAtArrival,
          nextSectionTop: nextRect ? Math.round(nextRect.top) : null,
          titleTop: Math.round(titleRect.top),
          titleVisibleBelowHeader: titleRect.top >= headerRect.bottom,
          titleClearancePx: Math.round(titleRect.top - headerRect.bottom),
          sealDimensions: {
            width: Math.round(sealRect.width),
            height: Math.round(sealRect.height),
            aspectRatio: (sealRect.width / sealRect.height).toFixed(3)
          },
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`,
      returnByValue: true
    });

    results[vp.name].principio = principioData.result.value;
    console.log('Princípio data:', JSON.stringify(principioData.result.value, null, 2));

    const shotPrincipio = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, `stage_principio_${vp.name}.png`), Buffer.from(shotPrincipio.data, 'base64'));
  }

  client.close();
  chromeProc.kill();

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'audit_results.json'), JSON.stringify(results, null, 2));
  console.log('\nAudit and screenshots completed successfully! Results written to audit_results.json');
}

run().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
