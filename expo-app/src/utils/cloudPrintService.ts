// React Native Expo - PrintNode Cloud Print Integration
// Silent, headless cloud printing for Touch Screen TVs and Public Kiosks
// No OS print dialog appears - sheet prints automatically within ~2 seconds!

import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

export async function sendToPrintNode({
  apiKey,
  printerId,
  htmlContent,
  title = 'PLAYYS Coloring Sheet',
}: {
  apiKey: string;
  printerId: string;
  htmlContent: string;
  title?: string;
}) {
  // Step 1: Render vector HTML to PDF on device using expo-print
  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    width: 612,  // 8.5 inches at 72 pt
    height: 792, // 11 inches at 72 pt
  });

  // Step 2: Read PDF as base64 string
  const base64Pdf = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Step 3: Dispatch print job to PrintNode Cloud API
  const response = await fetch('https://api.printnode.com/printjobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(apiKey + ':'),
    },
    body: JSON.stringify({
      printerId: parseInt(printerId, 10),
      title: title,
      contentType: 'pdf_base64',
      content: base64Pdf,
      source: 'PLAYYS Touch Screen Kiosk',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PrintNode failed (${response.status}): ${errorText}`);
  }

  const printJobId = await response.json();
  return { success: true, jobId: printJobId };
}
