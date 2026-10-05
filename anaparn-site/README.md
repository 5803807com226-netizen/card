# ANAPARN — Parallax / 3D / Pop-up portfolio

เว็บพอร์ตโฟลิโอแบบ static (HTML + CSS + JS ล้วน ไม่ใช้ library) เปิดได้ทันที:

```bash
cd anaparn-site && python3 -m http.server 8080   # แล้วเปิด http://localhost:8080
```
(ดับเบิลคลิก `index.html` ก็ได้เหมือนกัน)

## เทคนิคที่ใช้ (อยู่ใน `main.js` / `styles.css`)

| เอฟเฟกต์ | ทำยังไง |
|---|---|
| **3D Scene (Hero)** | `.stage { perspective }` + `.scene { transform-style: preserve-3d }` แล้ววางรูปแต่ละใบด้วย `translate3d(x, y, z)` — ค่า Z ต่างกัน = ใกล้/ไกลต่างกัน |
| **Mouse parallax** | ขยับเมาส์ → หมุนทั้ง scene ด้วย `rotateX/rotateY` (มี lerp ให้นุ่ม) ถ้าเป็นมือถือจะส่ายเองอัตโนมัติ |
| **Scroll fly-through** | Hero สูง 260vh + `position: sticky` → คำนวณ progress 0–1 แล้วบวก Z ให้ทุกใบ รูปจึงพุ่งเข้าหากล้อง |
| **Layered parallax** | `.layer[data-depth]` / `.layer-scroll[data-speed]` เลื่อนเร็วไม่เท่ากันตามค่า depth/speed |
| **Depth of field / fog** | ใบที่ไกลมากจะเบลอ + จางลง ใบที่ผ่านกล้องจะ fade out |
| **3D pop-up reveal** | `.reveal` เริ่มที่ `rotateX(-28deg) translateZ(-140px)` แล้วเด้งขึ้นเมื่อเลื่อนมาถึง (IntersectionObserver) ไล่ดีเลย์ด้วย `--d` |
| **Tilt + pop-out card** | การ์ด Work เอียงตามเมาส์ ส่วนลูก (การ์ด 9:16, thumbnails) ลอยออกมาด้วย `translateZ` ต่างระดับ |
| **3D modal** | คลิกการ์ดไหนก็ได้ → เด้งเข้ามาจาก `translateZ(-600px) rotateX(35deg)` |

## ใส่งานจริงของคุณ
- รูปทั้งหมดตอนนี้เป็น placeholder จาก picsum.photos — แก้ฟังก์ชัน `img()` หรือข้อมูลใน `heroFeatures`, `categories`, `featured` ด้านบนของ `main.js`
- รูปหน้าตรงกลาง: แก้ `src` ใน `.portrait` ของ `index.html` (แนะนำ PNG ไดคัทพื้นหลัง/ภาพขาวดำคอนทราสต์สูง)
- อยากให้เล่นวิดีโอจริงใน pop-up: เปลี่ยน `<img id="modal-img">` เป็น `<video>` แล้วส่ง URL วิดีโอผ่าน `data-project`

## อยากต่อยอด
- **GSAP + ScrollTrigger** — คุมไทม์ไลน์ scroll ละเอียดขึ้น (pin, scrub)
- **Lenis** — smooth scroll ให้ parallax ลื่นแบบเว็บรางวัล
- **Three.js / React Three Fiber** — ถ้าอยากได้ 3D จริง (แสง, เงา, shader, particle)
