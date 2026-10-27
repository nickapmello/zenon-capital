const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Usuario/.gemini/antigravity-ide/brain/ce88e1d2-ebe9-479e-beb3-0e27facdb6ec';
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

async function captureAll(suffix = 'test') {
  const tempDir = path.join(process.env.TEMP || 'C:/Temp', 'chrome_test_' + Date.now());
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
    throw new Error('Could not connect to Chrome');
  }

  const list = await getJson('http://127.0.0.1:9222/json/list');
  let target = list.find(t => t.type === 'page');
  if (!target) {
    target = await getJson('http://127.0.0.1:9222/json/new');
  }

  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  const resolutions = [
    { name: '1280x720', w: 1280, h: 720 },
    { name: '1366x768', w: 1366, h: 768 },
    { name: '1440x900', w: 1440, h: 900 },
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '2560x1080', w: 2560, h: 1080 }
  ];

  for (const res of resolutions) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: res.w,
      height: res.h,
      deviceScaleFactor: 1,
      mobile: false
    });

    await client.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(600);

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, `hero_${res.name}_${suffix}.png`);
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved: ${filePath}`);
  }

  client.close();
  chromeProc.kill();
}

const suffix = process.argv[2] || 'test';
captureAll(suffix).then(() => {
  console.log('Capture finished.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
