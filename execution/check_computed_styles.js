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

  for (const vp of [{name: 'Tablet 768px', w: 768, h: 1024}, {name: 'Mobile 390px', w: 390, h: 844}]) {
    await client.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w <= 600 });
    await client.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(600);
    const styles = await client.send('Runtime.evaluate', {
      expression: '(() => { const el = document.querySelector(".hero-bg-img"); const s = window.getComputedStyle(el); return { transform: s.transform, objectFit: s.objectFit, objectPosition: s.objectPosition, width: s.width, height: s.height, top: s.top, right: s.right }; })()',
      returnByValue: true
    });
    console.log(vp.name, styles.result.value);
  }
  client.close(); chromeProc.kill();
}
test();
