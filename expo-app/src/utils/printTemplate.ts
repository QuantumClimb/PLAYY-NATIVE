import { PlayyConfig } from '../types';
import { GeneratedCard } from '../cardTypes';

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

const HEAD_COLORS: Record<string, string> = { blue: '#2563EB', dreamyy: '#EC4899', sparkyy: '#F59E0B' };
const esc = (t: string) =>
  t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

const CARD_CSS = `
  .card-page { page-break-before: always; break-before: page; display: flex; justify-content: center; align-items: center; gap: 24px; min-height: 100vh; }
  .card { width: 3.4in; height: 5.1in; box-sizing: border-box; border-radius: 22px; padding: 7px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .card-in { height: 100%; box-sizing: border-box; background: #0F172A; border: 2px solid #FEF08A; border-radius: 16px; padding: 11px; color: #fff; display: flex; flex-direction: column; justify-content: space-between; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .badge { background: #1E293B; border: 1px solid #38BDF8; border-radius: 10px; padding: 3px 9px; font-size: 11px; font-weight: bold; }
  .rarity { background: #7C3AED; color: #FDE047; border-radius: 10px; padding: 3px 9px; font-size: 10px; font-weight: 900; }
  .name { text-align: center; font-size: 17px; font-weight: 900; }
  .sub { text-align: center; font-size: 10px; color: #94A3B8; font-weight: 700; letter-spacing: 1px; }
  .art { background: #fff; border-radius: 14px; height: 2.4in; display: flex; justify-content: center; align-items: center; }
  .art svg { height: 100%; width: auto; }
  .stats { display: flex; justify-content: space-around; background: #1E293B; border-radius: 12px; padding: 6px; text-align: center; font-size: 12px; }
  .stats b { display: block; color: #FACC15; } .stats i { display: block; font-style: normal; font-size: 8px; color: #64748B; }
  .foot { display: flex; justify-content: space-between; border-top: 1px solid #334155; padding-top: 4px; font-size: 9px; color: #64748B; font-weight: 700; }
  .box { background: #1E293B; border-radius: 12px; padding: 9px; }
  .bar { display: flex; align-items: center; gap: 6px; font-size: 9px; margin: 4px 0; }
  .bar span:first-child { width: 88px; color: #CBD5E1; font-weight: 700; }
  .track { flex: 1; height: 7px; background: #334155; border-radius: 4px; overflow: hidden; } .fill { height: 100%; }
  .ab { background: #1E293B; border-radius: 10px; padding: 7px; margin-top: 5px; } .ab-t { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; } .ab-t em { color: #FACC15; font-style: normal; } .ab-d { font-size: 9px; color: #94A3B8; }
  .quote { text-align: center; font-style: italic; font-size: 10px; color: #C4B5FD; }
`;

function cardPageHtml(card: GeneratedCard): string {
  const { stats, archetype, config, id } = card;
  const hero = esc((config.kidName?.trim() || 'PLAYY HERO').toUpperCase());
  const color = HEAD_COLORS[config.head] ?? '#2563EB';
  const bars = [
    ['POWER', stats.power, '#EF4444'],
    ['SPEED', stats.speed, '#EAB308'],
    ['INTELLIGENCE', stats.intelligence, '#3B82F6'],
    ['ENERGY', stats.energy, '#A855F7'],
    ['COURAGE', stats.courage, '#10B981'],
  ] as const;
  const abilities = [archetype.specialAbility1, archetype.specialAbility2];
  return `
  <div class="card-page">
    <div class="card" style="background:#FACC15"><div class="card-in">
      <div class="row"><span class="badge">${esc(archetype.element)}</span><span class="rarity">${archetype.rarity.toUpperCase()}</span></div>
      <div><div class="name">${hero}</div><div class="sub">${esc(archetype.title)}</div></div>
      <div class="art"><svg viewBox="0 0 850 1100" xmlns="http://www.w3.org/2000/svg">
        <rect width="850" height="1100" fill="#E0F2FE"/>
        <rect x="335" y="560" width="180" height="200" rx="45" fill="${color}"/>
        <ellipse cx="425" cy="440" rx="88" ry="82" fill="#FDE7D2"/>
        <circle cx="395" cy="435" r="8" fill="#111827"/><circle cx="455" cy="435" r="8" fill="#111827"/>
        <path d="M400 465 Q 425 490, 450 465" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      </svg></div>
      <div class="stats"><div><b>${stats.power}</b><i>PWR</i></div><div><b>${stats.speed}</b><i>SPD</i></div><div><b>${stats.intelligence}</b><i>INT</i></div><div><b>${stats.energy}</b><i>NRG</i></div></div>
      <div class="foot"><span>ID: #${esc(id.toUpperCase())}</span><span style="color:#38BDF8">PLAYYS TRUMP CARD</span></div>
    </div></div>
    <div class="card" style="background:#3B82F6"><div class="card-in">
      <div><div class="sub" style="color:#38BDF8">CHARACTER DOSSIER</div><div class="name">${esc(archetype.title.toUpperCase())}</div><div class="sub">${esc(archetype.subTitle)}</div></div>
      <div class="box">${bars
        .map(
          ([l, v, c]) =>
            `<div class="bar"><span>${l}</span><div class="track"><div class="fill" style="width:${v}%;background:${c}"></div></div><span style="width:22px;text-align:right;color:#FACC15">${v}</span></div>`,
        )
        .join('')}</div>
      <div>${abilities
        .map(
          (a) =>
            `<div class="ab"><div class="ab-t"><span>${esc(a.name)}</span><em>DMG: ${a.damage}</em></div><div class="ab-d">${esc(a.description)}</div></div>`,
        )
        .join('')}</div>
      <div class="quote">"${esc(archetype.quote)}"</div>
      <div class="foot"><span>CARD SERIAL: #${esc(id.toUpperCase())}</span><span style="color:#FACC15">AUTHENTIC COLLECTIBLE ★</span></div>
    </div></div>
  </div>`;
}

/** Page 1: coloring sheet. Page 2 (when a card exists): trump card front + back. */
export function generatePrintPackHtml(config: PlayyConfig, card: GeneratedCard | null): string {
  const base = generateColoringHtml(config);
  if (!card) return base;
  return base.replace('</style>', `${CARD_CSS}</style>`).replace('</body>', `${cardPageHtml(card)}</body>`);
}
