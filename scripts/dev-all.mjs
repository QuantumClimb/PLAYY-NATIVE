// Starts the kiosk server and the Vite dev server together (npm run dev:all). Ctrl+C stops both.
import { spawn } from 'node:child_process';

const run = (name, cmd) => {
  const child = spawn(cmd, { shell: true, stdio: 'inherit' });
  child.on('exit', (code) => {
    console.log(`[${name}] exited (${code})`);
    stopAll();
  });
  return child;
};

const children = [run('server', 'node server/kiosk-server.mjs'), run('web', 'npm run dev')];
let stopping = false;
function stopAll() {
  if (stopping) return;
  stopping = true;
  children.forEach((c) => c.kill());
  setTimeout(() => process.exit(0), 300);
}
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
