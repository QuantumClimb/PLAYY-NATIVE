// Silent printing for the kiosk PC: the PDFs are handed straight to the printer, with no print preview.
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { listPrinters } from './printers.mjs';

const SUMATRA_PATHS = [
  process.env.SUMATRA_PATH,
  'C:\\Program Files\\SumatraPDF\\SumatraPDF.exe',
  'C:\\Program Files (x86)\\SumatraPDF\\SumatraPDF.exe',
  path.join(process.env.LOCALAPPDATA || '', 'SumatraPDF', 'SumatraPDF.exe'),
].filter(Boolean);

const exists = (file) =>
  fs.access(file).then(
    () => true,
    () => false,
  );

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      { env: { ...process.env, ...env }, timeout: 60_000, windowsHide: true },
      (err, stdout, stderr) => (err ? reject(new Error(stderr?.trim() || err.message)) : resolve(stdout)),
    );
  });
}

const PRINT_TO_PRINTER =
  "Start-Process -FilePath $env:PLAYY_FILE -Verb PrintTo -ArgumentList ('\"' + $env:PLAYY_PRINTER + '\"') -WindowStyle Hidden -Wait";

/** Sends one PDF to the default printer. Windows: SumatraPDF when installed (fully silent), else the PDF app's own print command. */
async function printFile(file) {
  if (process.platform !== 'win32') return void (await run('lp', [file]));
  for (const sumatra of SUMATRA_PATHS) {
    if (await exists(sumatra)) return void (await run(sumatra, ['-print-to-default', '-silent', file]));
  }
  const printer = (await listPrinters()).find((p) => p.isDefault)?.name;
  if (!printer) throw new Error('No default printer is set');
  await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', PRINT_TO_PRINTER], {
    PLAYY_FILE: file,
    PLAYY_PRINTER: printer,
  });
}

/** Prints the given PDFs (Buffers) one after another. */
export async function printPdfs(pdfs) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'playys-print-'));
  try {
    for (const [index, pdf] of pdfs.entries()) {
      const file = path.join(dir, `page-${index + 1}.pdf`);
      await fs.writeFile(file, pdf);
      await printFile(file);
    }
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

/** A one-page PDF for TEST PRINT. */
export async function testPagePdf() {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawText('PLAYY test print', { x: 60, y: 760, size: 32, font });
  page.drawText(new Date().toLocaleString('en-IN'), { x: 60, y: 720, size: 14, font });
  return Buffer.from(await pdf.save());
}
