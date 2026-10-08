// Local print helper for the kiosk PC.
// Lists installed printers and can set the default one (used by Chrome --kiosk-printing).
// Run with: npm run printer-helper   (listens on 127.0.0.1:3001; Vite proxies /api to it)
import http from 'node:http';
import { execFile } from 'node:child_process';

const PORT = Number(process.env.PRINTER_HELPER_PORT || 3001);
const HOST = '127.0.0.1';

const STATUS = { 3: 'ready', 4: 'printing', 5: 'warming-up', 6: 'error', 7: 'offline' };

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { env: { ...process.env, ...env }, timeout: 15000, windowsHide: true }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr?.trim() || err.message));
      else resolve(stdout);
    });
  });
}

async function listPrinters() {
  if (process.platform === 'win32') {
    const ps =
      'Get-CimInstance Win32_Printer | Select-Object Name,Default,WorkOffline,PrinterStatus,PortName,DriverName | ConvertTo-Json -Compress';
    const out = (await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps])).trim();
    if (!out) return [];
    const rows = [].concat(JSON.parse(out));
    return rows.map((p) => ({
      name: p.Name,
      isDefault: !!p.Default,
      port: p.PortName,
      driver: p.DriverName,
      status: p.WorkOffline ? 'offline' : STATUS[p.PrinterStatus] || 'unknown',
    }));
  }
  // macOS / Linux (CUPS)
  const out = await run('lpstat', ['-p', '-d']);
  const def = /system default destination:\s*(\S+)/.exec(out)?.[1];
  return [...out.matchAll(/^printer (\S+) (.*)$/gm)].map((m) => ({
    name: m[1],
    isDefault: m[1] === def,
    status: /disabled/.test(m[2]) ? 'offline' : /now printing/.test(m[2]) ? 'printing' : 'ready',
  }));
}

async function setDefault(name) {
  // The name is validated against the installed list by the caller and passed via env, never interpolated.
  if (process.platform === 'win32') {
    await run(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', '(New-Object -ComObject WScript.Network).SetDefaultPrinter($env:PLAYY_PRINTER)'],
      { PLAYY_PRINTER: name },
    );
  } else {
    await run('lpoptions', ['-d', name]);
  }
}

function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

http
  .createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/api/printers') {
        return send(res, 200, { printers: await listPrinters() });
      }
      if (req.method === 'POST' && req.url === '/api/printers/default') {
        let raw = '';
        for await (const chunk of req) raw += chunk;
        const { name } = JSON.parse(raw || '{}');
        const printers = await listPrinters();
        if (!printers.some((p) => p.name === name)) return send(res, 404, { error: 'Unknown printer' });
        await setDefault(name);
        return send(res, 200, { printers: await listPrinters() });
      }
      send(res, 404, { error: 'Not found' });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
  })
  .listen(PORT, HOST, () => console.log(`PLAYYS printer helper on http://${HOST}:${PORT}`));
