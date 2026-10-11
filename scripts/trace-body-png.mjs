import fs from 'node:fs';
import { WebSocket } from 'ws';

const crop = { x: 15, y: 130, w: 1225, h: 1030 };

async function traceImage(dataUrl, cropBox, regionPoints, name) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const width = canvas.width;
  const height = canvas.height;
  const size = width * height;
  const line = new Uint8Array(size);
  for (let i = 0; i < size; i += 1) {
    const p = i * 4;
    const luminance = data[p] * 0.2126 + data[p + 1] * 0.7152 + data[p + 2] * 0.0722;
    line[i] = data[p + 3] > 0 && luminance < 225 ? 1 : 0;
  }

  const labels = new Int32Array(size);
  labels.fill(-1);
  const components = [];
  const stack = [];
  const visit = (start, id) => {
    stack.length = 0;
    stack.push(start);
    labels[start] = id;
    let count = 0, minX = width, minY = height, maxX = 0, maxY = 0, sumX = 0, sumY = 0, edge = false;
    while (stack.length) {
      const at = stack.pop();
      const x = at % width;
      const y = Math.floor(at / width);
      count += 1;
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      sumX += x; sumY += y;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) edge = true;
      for (const next of [at - 1, at + 1, at - width, at + width]) {
        if (next < 0 || next >= size || labels[next] !== -1 || line[next]) continue;
        const nx = next % width;
        if (Math.abs(nx - x) + Math.abs(Math.floor(next / width) - y) !== 1) continue;
        labels[next] = id;
        stack.push(next);
      }
    }
    components.push({ id, count, minX, minY, maxX, maxY, cx: sumX / count, cy: sumY / count, edge });
  };
  for (let i = 0; i < size; i += 1) if (!line[i] && labels[i] === -1) visit(i, components.length);
  const background = components.filter((component) => component.edge).sort((a, b) => b.count - a.count)[0]?.id;
  const byPart = new Map(regionPoints.map((point) => [point.part, point]));
  const partPaths = new Map();
  const pathForComponent = (component) => {
    const rows = [];
    for (let y = component.minY; y <= component.maxY; y += 1) {
      let start = -1;
      for (let x = component.minX; x <= component.maxX + 1; x += 1) {
        const match = x <= component.maxX && labels[y * width + x] === component.id;
        if (match && start < 0) start = x;
        if (!match && start >= 0) {
          const rx = start - cropBox.x;
          const ry = y - cropBox.y;
          rows.push(`M${rx} ${ry}h${x - start}v1H${rx}z`);
          start = -1;
        }
      }
    }
    return rows.join('');
  };
  const nearestPart = (component) => {
    let best = 'hoodie';
    let distance = Infinity;
    for (const point of regionPoints) {
      const d = (component.cx - point.x) ** 2 + (component.cy - point.y) ** 2;
      if (d < distance) { distance = d; best = point.part; }
    }
    return best;
  };
  for (const component of components) {
    if (component.id === background || component.count < 40) continue;
    const part = nearestPart(component);
    if (!partPaths.has(part)) partPaths.set(part, []);
    partPaths.get(part).push(pathForComponent(component));
  }

  const blackRuns = [];
  for (let y = cropBox.y; y < cropBox.y + cropBox.h; y += 1) {
    let start = -1;
    for (let x = cropBox.x; x <= cropBox.x + cropBox.w; x += 1) {
      const match = x < cropBox.x + cropBox.w && line[y * width + x];
      if (match && start < 0) start = x;
      if (!match && start >= 0) {
        const rx = start - cropBox.x;
        blackRuns.push(`M${rx} ${y - cropBox.y}h${x - start}v1H${rx}z`);
        start = -1;
      }
    }
  }
  const order = ['hoodie', 'trim', 'cuffs', 'tassles', 'trousers', 'shoes', 'soles', 'gloves'];
  const fills = order.map((part) => {
    const paths = partPaths.get(part) ?? [];
    return `<g id="${part}" fill="#ffffff">${paths.map((path) => `<path d="${path}"/>`).join('')}</g>`;
  }).join('');
  const anchors = regionPoints.filter((point) => point.part === 'anchor').map((point) => `<circle id="anchor_${point.name}" cx="${point.x - cropBox.x}" cy="${point.y - cropBox.y}" r="3" fill="none"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropBox.w} ${cropBox.h}"><g id="${name}">${anchors}${fills}<g id="pose_outline" fill="#171614">${`<path d="${blackRuns.join('')}"/>`}</g></g></svg>`;
}

const tabs = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const target = tabs.find((tab) => tab.type === 'page' && tab.url.startsWith('http://localhost:3000'));
if (!target) throw new Error('No local browser page is available for PNG decoding');
const socket = new WebSocket(target.webSocketDebuggerUrl);
let commandId = 0;
const pending = new Map();
socket.on('message', (buffer) => {
  const message = JSON.parse(buffer);
  const resolve = pending.get(message.id);
  if (!resolve) return;
  pending.delete(message.id);
  message.error ? resolve(Promise.reject(message.error)) : resolve(message.result);
});
await new Promise((resolve) => socket.once('open', resolve));
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++commandId;
  pending.set(id, (result) => result instanceof Promise ? result.catch(reject) : resolve(result));
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => (await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;

const inputs = [
  {
    input: 'D:/QUANTUM CLIMB - PROJECTS/PROJECTS/PLAYYS/All characters/Dreamy/body/DreamyBody3.png',
    output: 'public/assets/SVG/poses/playy-3.svg',
    name: 'playy-3',
    points: [
      { part: 'anchor', name: 'neck', x: 627, y: 300 }, { part: 'anchor', name: 'chest', x: 627, y: 520 },
      { part: 'hoodie', x: 627, y: 430 }, { part: 'hoodie', x: 355, y: 440 }, { part: 'hoodie', x: 900, y: 440 },
      { part: 'trim', x: 627, y: 715 }, { part: 'trim', x: 627, y: 220 },
      { part: 'tassles', x: 520, y: 440 }, { part: 'tassles', x: 735, y: 440 },
      { part: 'cuffs', x: 270, y: 320 }, { part: 'cuffs', x: 970, y: 570 },
      { part: 'gloves', x: 150, y: 250 }, { part: 'gloves', x: 1040, y: 700 },
      { part: 'trousers', x: 500, y: 820 }, { part: 'trousers', x: 760, y: 820 },
      { part: 'cuffs', x: 450, y: 875 }, { part: 'cuffs', x: 800, y: 875 },
      { part: 'shoes', x: 420, y: 1000 }, { part: 'shoes', x: 835, y: 1000 },
      { part: 'soles', x: 420, y: 1100 }, { part: 'soles', x: 835, y: 1100 },
    ],
  },
  {
    input: 'D:/QUANTUM CLIMB - PROJECTS/PROJECTS/PLAYYS/All characters/Dreamy/body/DreamyBody4.png',
    output: 'public/assets/SVG/poses/playy-4.svg',
    name: 'playy-4',
    points: [
      { part: 'anchor', name: 'neck', x: 627, y: 320 }, { part: 'anchor', name: 'chest', x: 627, y: 535 },
      { part: 'hoodie', x: 627, y: 450 }, { part: 'hoodie', x: 355, y: 430 }, { part: 'hoodie', x: 900, y: 430 },
      { part: 'trim', x: 627, y: 700 }, { part: 'trim', x: 627, y: 220 },
      { part: 'tassles', x: 520, y: 440 }, { part: 'tassles', x: 735, y: 440 },
      { part: 'cuffs', x: 250, y: 470 }, { part: 'cuffs', x: 1000, y: 470 },
      { part: 'gloves', x: 110, y: 440 }, { part: 'gloves', x: 1140, y: 440 },
      { part: 'trousers', x: 500, y: 820 }, { part: 'trousers', x: 760, y: 820 },
      { part: 'cuffs', x: 450, y: 880 }, { part: 'cuffs', x: 800, y: 880 },
      { part: 'shoes', x: 420, y: 1000 }, { part: 'shoes', x: 835, y: 1000 },
      { part: 'soles', x: 420, y: 1100 }, { part: 'soles', x: 835, y: 1100 },
    ],
  },
];

for (const item of inputs) {
  const dataUrl = `data:image/png;base64,${fs.readFileSync(item.input).toString('base64')}`;
  const expression = `(${traceImage.toString()})(${JSON.stringify(dataUrl)},${JSON.stringify(crop)},${JSON.stringify(item.points)},${JSON.stringify(item.name)})`;
  const svg = await evaluate(expression);
  fs.writeFileSync(item.output, svg, 'utf8');
  console.log(`${item.output}: ${svg.length} bytes`);
}
socket.close();
