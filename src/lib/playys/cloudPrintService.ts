/**
 * Cloud & USB Printer Integration Service & Guide
 * Tailored for USB-only printers like Canon PIXMA G2430 and Cloud Gateways.
 */

export interface CloudPrinterConfig {
  provider: 'canon_usb' | 'printnode' | 'ezeep' | 'email_print' | 'ipp_network';
  apiKey: string;
  printerId: string;
  printerName: string;
  emailAddress?: string;
  networkIp?: string;
  paperSize: 'Letter' | 'A4';
  copies: number;
  silentPrint: boolean;
}

export const DEFAULT_CLOUD_PRINTER_CONFIG: CloudPrinterConfig = {
  provider: 'canon_usb',
  apiKey: 'demo_pk_live_84920491823',
  printerId: 'CANON_G2430_USB',
  printerName: 'Canon PIXMA G2430 (USB Direct)',
  emailAddress: 'playys-kiosk@print.service.local',
  networkIp: '127.0.0.1',
  paperSize: 'A4',
  copies: 1,
  silentPrint: true,
};

export interface PrintJobStatus {
  id: string;
  stage: 'idle' | 'generating' | 'transmitting' | 'spooling' | 'completed' | 'error';
  progress: number;
  message: string;
  timestamp: string;
  jobId?: string;
}

/**
 * Production Code & Configuration Snippets for Canon PIXMA G2430 (USB) & Cloud
 */
export const CLOUD_PRINT_CODE_SNIPPETS = {
  canonUsbKiosk: `// =========================================================================
// METHOD 1 (RECOMMENDED): SILENT USB KIOSK PRINTING (NO EXTRA CLOUD SERVICE)
// =========================================================================
// For a Touch Screen TV connected to a Mini PC / Laptop / Intel NUC via HDMI,
// with the Canon PIXMA G2430 plugged directly into the USB port.
//
// HOW IT WORKS:
// When the kid taps "PRINT", the app triggers window.print().
// By launching Chrome or Edge with the "--kiosk --kiosk-printing" flag,
// Windows automatically routes the printout directly to the USB Canon G2430
// SILENTLY in ~1 second with ZERO dialogs or popups appearing on screen!
//
// 1. In Windows: Go to Settings -> Printers -> Click Canon PIXMA G2430 -> "Set as default printer"
// 2. Launch your browser with this one-line command (or save as start-kiosk.bat):
//
// On Windows (Command Prompt or start-kiosk.bat):
// "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --kiosk --kiosk-printing "http://localhost:3000"
//
// On Microsoft Edge:
// "msedge.exe" --kiosk --kiosk-printing "http://localhost:3000"
//
// On Linux / Raspberry Pi:
// chromium-browser --kiosk --kiosk-printing "http://localhost:3000"
//
// RESULT: Every time a kid finishes, the Canon PIXMA G2430 prints immediately over USB!`,

  printnodeUsb: `// =========================================================================
// METHOD 2: PRINTNODE USB BRIDGE (PRINT FROM EXPO / TABLET TO USB PRINTER)
// =========================================================================
// Perfect if your Touch TV runs Android, or if you want centralized cloud control.
// 
// ARCHITECTURE:
// [Touch Screen TV / Expo App]
//       ↓ HTTPS POST (base64 PDF)
// [PrintNode Cloud Server]
//       ↓ Sync over WebSocket
// [PrintNode Desktop Client on PC / Raspberry Pi]
//       ↓ Local USB Spooler (0.5 sec)
// [Canon PIXMA G2430 USB Cable]
//
// HOW TO SET UP (Takes 2 minutes):
// 1. Plug Canon PIXMA G2430 into USB port of PC or Raspberry Pi.
// 2. Install the free PrintNode Client app (https://www.printnode.com) on that PC.
// 3. PrintNode immediately detects "Canon G2430 series (USB)".
// 4. In your Expo / React Native code:

import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

export async function printToCanonG2430Usb({
  apiKey,
  printerId, // PrintNode ID for Canon G2430
  htmlContent,
}: {
  apiKey: string;
  printerId: string;
  htmlContent: string;
}) {
  // 1. Generate 300 DPI vector PDF
  const { uri } = await Print.printToFileAsync({ html: htmlContent });
  const base64Pdf = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 2. Dispatch to PrintNode -> Canon USB
  const response = await fetch('https://api.printnode.com/printjobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(apiKey + ':'),
    },
    body: JSON.stringify({
      printerId: parseInt(printerId, 10),
      title: 'PLAYYS Coloring Sheet',
      contentType: 'pdf_base64',
      content: base64Pdf,
      source: 'Canon PIXMA G2430 USB Kiosk',
    }),
  });

  return await response.json();
}`,

  nodeUsbService: `// =========================================================================
// METHOD 3: LOCAL NODE.JS USB DAEMON (EXPRESS + pdf-to-printer)
// =========================================================================
// A tiny background script running on the computer plugged into the Canon G2430.
// Listens on localhost:5000/print and sends raw PDF to Canon USB spooler.

import express from 'express';
import fs from 'fs';
import path from 'path';
import { print } from 'pdf-to-printer'; // npm install pdf-to-printer

const app = express();
app.use(express.json({ limit: '20mb' }));

app.post('/api/usb-print', async (req, res) => {
  try {
    const { pdfBase64, filename = 'coloring-page.pdf' } = req.body;
    const tempPath = path.join(process.cwd(), 'temp_' + filename);
    
    // Write PDF to temp disk
    fs.writeFileSync(tempPath, Buffer.from(pdfBase64, 'base64'));

    // Send directly to Canon PIXMA G2430 over USB
    await print(tempPath, {
      printer: 'Canon G2430 series', // Exact Windows printer name
      paperSize: 'A4',
      silent: true,
    });

    // Cleanup temp file
    fs.unlinkSync(tempPath);

    res.json({ success: true, message: 'Dispatched to Canon PIXMA G2430 via USB' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Canon USB Print Daemon running on port 5000'));`,

  raspberryPiCups: `// =========================================================================
// METHOD 4: $35 RASPBERRY PI WIRELESS PRINT SERVER FOR CANON G2430
// =========================================================================
// Turn your non-Wi-Fi Canon PIXMA G2430 into a smart Wi-Fi & AirPrint printer!
// 
// 1. Connect Canon G2430 via USB to a Raspberry Pi Zero W or Pi 4 ($15 - $35).
// 2. Open terminal on the Pi and install CUPS:
//    sudo apt update && sudo apt install cups -y
//    sudo usermod -a -G lpadmin pi
//    sudo cupsctl --remote-admin --remote-any
//
// 3. Open http://raspberrypi.local:631 in browser:
//    Administration -> Add Printer -> Select "Canon G2430 series (USB)"
//    Check "Share This Printer".
//
// 4. NOW: The Canon G2430 is broadcasted over Wi-Fi as a network printer!
//    Any Touch TV, iPad, or Expo app on the Wi-Fi can print to it wirelessly,
//    and the Pi feeds the paper through the USB cable!`,
};
