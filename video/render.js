// Render anim.html to frames with Playwright, then stitch to MP4 with FFmpeg.
// Usage: node video/render.js [fps]   (needs playwright + ffmpeg)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const fps = Number(process.argv[2] || 30);
const dir = __dirname;
const frames = path.join(dir, 'frames');

(async () => {
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file://' + path.join(dir, 'anim.html'));
  await page.waitForFunction(() => window.ready);
  const total = Math.round((await page.evaluate(() => window.DURATION)) * fps);
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.draw(t), i / fps);
    await page.screenshot({ path: path.join(frames, `${String(i).padStart(4, '0')}.png`) });
  }
  await browser.close();

  const ff = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  ff('-framerate', String(fps), '-i', path.join(frames, '%04d.png'),
     '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path.join(dir, 'out.mp4'));
  // Contact sheet: one frame per second, so Claude can check the look without watching the video.
  ff('-i', path.join(dir, 'out.mp4'), '-vf', 'fps=1,scale=320:-1,tile=4x3', '-frames:v', '1', path.join(dir, 'contact.png'));
  console.log(`done: ${total} frames -> video/out.mp4, video/contact.png`);
})();
