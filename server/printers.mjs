// Printer discovery for the kiosk PC (Windows via PowerShell, macOS/Linux via CUPS).
import { execFile } from 'node:child_process';

const STATUS = { 3: 'ready', 4: 'printing', 5: 'warming-up', 6: 'error', 7: 'offline' };

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { env: { ...process.env, ...env }, timeout: 15000, windowsHide: true }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr?.trim() || err.message));
      else resolve(stdout);
    });
  });
}

export async function listPrinters() {
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

export async function setDefault(name) {
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

