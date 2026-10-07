// Render a canvas animation page to frames with Playwright, then stitch to MP4 with FFmpeg.
// Usage: node video/render.js [page.html] [fps]   (needs playwright + ffmpeg)
// The page must define window.draw(t), window.DURATION, and set window.ready when fonts load.
// Optional window.SIZE = [width, height] (default 1280x720). Output goes next to the page.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const html = path.resolve(process.argv[2] || path.join(__dirname, 'anim.html'));
const fps = Number(process.argv[3] || 30);
const dir = path.dirname(html);
const frames = path.join(dir, 'frames');

(async () => {
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + html);
  await page.waitForFunction(() => window.ready);
  const [width, height] = await page.evaluate(() => window.SIZE || [1280, 720]);
  await page.setViewportSize({ width, height });
  const total = Math.round((await page.evaluate(() => window.DURATION)) * fps);
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.draw(t), i / fps);
    await page.screenshot({ path: path.join(frames, `${String(i).padStart(4, '0')}.png`) });
  }
  await browser.close();

  const ff = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  ff('-framerate', String(fps), '-i', path.join(frames, '%04d.png'),
     '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path.join(dir, 'out.mp4'));
  // Contact sheet: two frames per second, so Claude can check the look without watching the video.
  const tile = width < height ? 'tile=7x3' : 'tile=4x3';
  ff('-i', path.join(dir, 'out.mp4'), '-vf', `fps=2,scale=240:-1,${tile}`, '-frames:v', '1', path.join(dir, 'contact.png'));
  console.log(`done: ${total} frames -> ${path.relative(process.cwd(), dir)}/out.mp4, contact.png`);
})();
