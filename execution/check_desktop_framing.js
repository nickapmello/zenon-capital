const { spawn } = require('child_process');
const http = require('http');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) { this.ws = new globalThis.WebSocket(wsUrl); this.id = 1; this.callbacks = new Map(); }
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve; this.ws.onerror = reject;
      this.ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id); this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message)); else cb.resolve(msg.result);
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++; this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  close() { this.ws.close(); }
}

async function test() {
  const chromeProc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=9222', '--disable-gpu', '--no-first-run', 'about:blank']);
  await sleep(1500);
  const list = await getJson('http://127.0.0.1:9222/json/list');
  const client = new CDPClient(list[0].webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');

  const resolutions = [
    { name: '1280x720', w: 1280, h: 720 },
    { name: '1366x768', w: 1366, h: 768 },
    { name: '1440x900', w: 1440, h: 900 },
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '2560x1080', w: 2560, h: 1080 }
  ];

  for (const vp of resolutions) {
    await client.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: false });
    await client.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(600);
    const data = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const img = document.querySelector(".hero-bg-img");
        const hero = document.getElementById("stage-hero");
        const s = window.getComputedStyle(img);
        const imgRect = img.getBoundingClientRect();
        const heroRect = hero.getBoundingClientRect();
        return {
          viewport: window.innerWidth + 'x' + window.innerHeight,
          heroHeight: heroRect.height,
          imgRendered: {
            width: Math.round(imgRect.width),
            height: Math.round(imgRect.height),
            top: Math.round(imgRect.top),
            bottom: Math.round(imgRect.bottom),
            left: Math.round(imgRect.left),
            right: Math.round(imgRect.right)
          },
          aspectRatio: (imgRect.width / imgRect.height).toFixed(3),
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        };
      })()`,
      returnByValue: true
    });
    console.log(vp.name, data.result.value);
  }
  client.close(); chromeProc.kill();
}
test();
