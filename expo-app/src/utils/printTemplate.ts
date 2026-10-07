import { PlayyConfig } from '../types';

export function generateColoringHtml(config: PlayyConfig): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PLAYYS Coloring Sheet</title>
  <style>
    @page { size: letter portrait; margin: 0.25in; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: sans-serif;
      background: #FFFFFF;
    }
    .sheet-card {
      width: 100%;
      max-width: 780px;
      border: 4px solid #111827;
      border-radius: 24px;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    h1 {
      margin: 0 0 4px 0;
      font-size: 32px;
      color: #111827;
      letter-spacing: 2px;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #64748B;
      font-weight: bold;
    }
    svg {
      width: 100%;
      height: auto;
      max-height: 820px;
    }
    .footer {
      margin-top: 16px;
      font-size: 12px;
      color: #94A3B8;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="sheet-card">
    <h1>PLAYYS</h1>
    <p>Imagine &bull; Create &bull; Play &bull; Config: ${config.head} - ${config.pose} - ${config.symbol}</p>
    <svg viewBox="0 0 850 1100" xmlns="http://www.w3.org/2000/svg">
      <rect width="840" height="1090" x="5" y="5" rx="20" fill="none" stroke="#111827" stroke-width="4"/>
      <!-- Background Outline -->
      <path d="M-50 820 Q 200 700, 500 780 T 900 740 L 900 1100 L -50 1100 Z" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <!-- Body -->
      <rect x="335" y="560" width="180" height="200" rx="45" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <circle cx="425" cy="630" r="35" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <text x="425" y="642" font-size="32" text-anchor="middle" fill="#111827">★</text>
      <!-- Head -->
      <ellipse cx="425" cy="440" rx="88" ry="82" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <circle cx="395" cy="435" r="8" fill="#111827"/>
      <circle cx="455" cy="435" r="8" fill="#111827"/>
      <path d="M400 465 Q 425 490, 450 465" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
    </svg>
    <div class="footer">PLAYYS &bull; Small Playys. Big Imagination! &bull; Printable Coloring Page</div>
  </div>
</body>
</html>
`;
}
