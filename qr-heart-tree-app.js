const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3001;
const TARGET_COUNT = 30;

let count = 0;
let bubbles = [];
let nextId = 1;

app.use(express.json());

function makeBubble() {
  // 세균 중심 쪽으로 넓게 퍼지는 거품
  const cx = 50;
  const cy = 48;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 30;

  return {
    id: nextId++,
    x: cx + Math.cos(angle) * radius + (Math.random() * 8 - 4),
    y: cy + Math.sin(angle) * radius + (Math.random() * 8 - 4),
    size: Math.round(Math.random() * 90) + 90,
    opacity: (Math.random() * 0.14 + 0.80).toFixed(2)
  };
}

function payload() {
  return {
    count,
    target: TARGET_COUNT,
    bubbles,
    done: count >= TARGET_COUNT
  };
}

function emitState() {
  io.emit('update', payload());
}

app.get('/screen', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Hand Hygiene Finale</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  overflow:hidden;
  font-family:Arial,sans-serif;
  background:linear-gradient(180deg,#eef8fd 0%,#f8fcff 100%);
}
.stage{
  position:relative;
  width:100vw;
  height:100vh;
  overflow:hidden;
}
.scene{
  position:absolute;
  inset:0;
  transition:filter 1.2s ease, opacity 1.2s ease;
}
.stage.end .scene{
  filter:blur(8px);
  opacity:.65;
}

/* 세균 중앙 */
.germ-wrap{
  position:absolute;
  left:50%;
  top:50%;
  width:560px;
  height:560px;
  transform:translate(-50%,-50%);
}
.germ{
  position:absolute;
  left:100px;
  top:100px;
  width:360px;
  height:360px;
  border-radius:50%;
  background:#ef0018;
  box-shadow:0 20px 42px rgba(190,0,20,.18);
}
.spike{
  position:absolute;
  width:24px;
  height:92px;
  background:#c70016;
  left:50%;
  top:-50px;
  transform-origin:center 186px;
  margin-left:-12px;
}
.spike::after{
  content:'';
  position:absolute;
  left:50%;
  top:-18px;
  width:60px;
  height:42px;
  margin-left:-30px;
  border-radius:999px;
  background:#c70016;
}
.blob{
  position:absolute;
  border-radius:50%;
  background:#c70016;
}
.eye{
  position:absolute;
  top:118px;
  width:94px;
  height:38px;
  background:#fff;
  border-radius:80px;
  overflow:hidden;
}
.eye.left{left:74px;transform:rotate(-5deg)}
.eye.right{right:74px;transform:rotate(5deg)}
.pupil{
  position:absolute;
  width:34px;
  height:34px;
  background:#111;
  border-radius:50%;
  top:2px;
}
.eye.left .pupil{right:8px}
.eye.right .pupil{left:8px}
.lid{
  position:absolute;
  left:-4px;
  right:-4px;
  top:-8px;
  height:20px;
  background:#ef0018;
}
.mouth{
  position:absolute;
  left:50%;
  bottom:76px;
  transform:translateX(-50%);
  width:128px;
  height:84px;
  background:#fff;
  border-radius:0 0 70px 70px;
}
.mouth-line{
  position:absolute;
  left:50%;
  bottom:118px;
  transform:translateX(-50%);
  width:86px;
  height:24px;
  border-bottom:7px solid #111;
  border-radius:0 0 60px 60px;
}
.tooth-h{
  position:absolute;
  left:50%;
  bottom:116px;
  transform:translateX(-50%);
  width:66px;
  height:6px;
  background:#111;
  border-radius:4px;
}
.tooth-v{
  position:absolute;
  bottom:104px;
  width:6px;
  height:28px;
  background:#111;
  border-radius:4px;
}
.tooth-v.t1{left:166px}
.tooth-v.t2{left:194px}
.tooth-v.t3{left:222px}

/* 손 */
.hand-zone{
  position:absolute;
  left:50%;
  top:50%;
  width:360px;
  height:270px;
  transform:translate(-118%,18%);
  z-index:12;
}
.hand{
  position:absolute;
  font-size:172px;
  line-height:1;
  filter:drop-shadow(0 8px 16px rgba(0,0,0,.08));
}
.hand.back{
  left:0;
  bottom:0;
  animation:rubBack 2.1s ease-in-out infinite;
}
.hand.front{
  left:92px;
  bottom:14px;
  animation:rubFront 2.1s ease-in-out infinite;
}

/* 손 위 보글 거품 */
.palm-foam{
  position:absolute;
  left:94px;
  bottom:98px;
  width:120px;
  height:120px;
  border-radius:50%;
  background:rgba(189,229,255,.72);
  box-shadow:0 8px 18px rgba(96,167,214,.16);
}
.palm-foam::before,
.palm-foam::after{
  content:'';
  position:absolute;
  border-radius:50%;
  background:rgba(189,229,255,.82);
}
.palm-foam::before{
  width:48px;height:48px;left:-16px;top:24px;
}
.palm-foam::after{
  width:36px;height:36px;right:-10px;top:8px;
}
.palm-bubble{
  position:absolute;
  border-radius:50%;
  background:rgba(196,233,255,.86);
  box-shadow:
    inset -6px -8px 0 rgba(255,255,255,.16),
    inset 10px 8px 0 rgba(255,255,255,.35);
  animation:palmFloat 4.4s ease-in-out infinite;
}
.pb1{left:118px;bottom:152px;width:28px;height:28px;animation-delay:0s}
.pb2{left:164px;bottom:172px;width:22px;height:22px;animation-delay:.8s}
.pb3{left:200px;bottom:148px;width:18px;height:18px;animation-delay:1.6s}
.pb4{left:142px;bottom:120px;width:16px;height:16px;animation-delay:2.4s}
.pb5{left:182px;bottom:108px;width:24px;height:24px;animation-delay:3.1s}

/* 세균 위 큰 거품 */
.bubbles-layer{
  position:absolute;
  inset:0;
  z-index:18;
}
.bubble{
  position:absolute;
  border-radius:50%;
  background:rgba(190,229,255,.82);
  box-shadow:
    inset -12px -16px 0 rgba(255,255,255,.18),
    inset 14px 12px 0 rgba(255,255,255,.36),
    0 10px 20px rgba(107,179,227,.16);
  animation:bubblePop .7s ease-out;
}
.bubble::before{
  content:'';
  position:absolute;
  width:24%;
  height:24%;
  left:14%;
  top:12%;
  border-radius:50%;
  background:rgba(255,255,255,.74);
}
.bubble::after{
  content:'';
  position:absolute;
  width:13%;
  height:13%;
  left:34%;
  top:10%;
  border-radius:50%;
  background:rgba(255,255,255,.58);
}

/* 엔딩 */
.overlay{
  position:absolute;
  inset:0;
  display:none;
  align-items:center;
  justify-content:center;
  z-index:50;
}
.overlay.show{display:flex}

.clear-wrap{
  position:relative;
  width:min(96vw,1300px);
  height:min(96vh,860px);
}

.ban-circle{
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  width:500px;
  height:500px;
  border:30px solid #f24516;
  border-radius:50%;
  animation:banIn 1s ease-out;
}
.ban-line{
  position:absolute;
  left:50%;
  top:50%;
  width:560px;
  height:30px;
  background:#f24516;
  transform:translate(-50%,-50%) rotate(-35deg);
  border-radius:20px;
  animation:banIn 1s ease-out;
}

.clear-text{
  position:absolute;
  left:50%;
  top:54%;
  transform:translate(-50%,-50%) scale(1);
  font-size:clamp(88px,11vw,178px);
  font-weight:700;
  letter-spacing:-2px;
  color:#ffffff;
  -webkit-text-stroke:3px #187fd3;
  text-shadow:
    0 6px 0 rgba(24,127,211,.85),
    0 14px 24px rgba(24,127,211,.22);
  animation:clearPop 1.2s ease-out forwards;
  z-index:7;
  transition:transform 1.2s ease, opacity 1.2s ease;
}
.overlay.phase-thanks .clear-text{
  transform:translate(-50%,-50%) scale(.82);
  opacity:0;
}

.thanks{
  position:absolute;
  left:50%;
  top:55%;
  transform:translate(-50%,-50%);
  font-size:clamp(48px,4.2vw,88px);
  font-weight:900;
  color:#0a4263;
  letter-spacing:-2px;
  white-space:nowrap;
  opacity:0;
  transition:opacity 1.2s ease, transform 1.2s ease;
  z-index:8;
}
.overlay.phase-thanks .thanks{
  opacity:1;
  transform:translate(-50%,-50%);
}

/* 컨페티 */
.confetti-layer{
  position:absolute;
  inset:0;
  opacity:0;
  transition:opacity .9s ease;
  pointer-events:none;
}
.overlay.phase-confetti .confetti-layer{
  opacity:1;
}
.confetti{
  position:absolute;
  top:-60px;
  animation-name:fall;
  animation-timing-function:linear;
  animation-iteration-count:infinite;
}
.confetti.dot{
  width:10px;
  height:10px;
  border-radius:50%;
}
.confetti.rect{
  width:10px;
  height:24px;
  border-radius:8px;
}
.confetti.ribbon{
  width:14px;
  height:54px;
  background:transparent !important;
}
.confetti.ribbon::before{
  content:'';
  position:absolute;
  inset:0;
  border-radius:999px;
  border-left:6px solid currentColor;
  transform:skewY(10deg);
}
.spark{
  position:absolute;
  width:16px;
  height:16px;
  background:#fff;
  transform:rotate(45deg);
  box-shadow:0 0 18px rgba(255,255,255,.95);
  animation:twinkle 2.4s ease-in-out infinite;
}
.s1{left:220px;top:160px}
.s2{right:220px;top:180px}
.s3{left:280px;bottom:180px}
.s4{right:280px;bottom:180px}
.s5{left:50%;top:120px;transform:translateX(-50%) rotate(45deg)}

@keyframes bubblePop{
  0%{transform:scale(.2);opacity:0}
  70%{transform:scale(1.08);opacity:1}
  100%{transform:scale(1);opacity:1}
}
@keyframes rubFront{
  0%,100%{transform:translate(0,0) rotate(-9deg)}
  50%{transform:translate(24px,-10px) rotate(9deg)}
}
@keyframes rubBack{
  0%,100%{transform:translate(0,0) rotate(7deg)}
  50%{transform:translate(-14px,8px) rotate(-7deg)}
}
@keyframes palmFloat{
  0%,100%{transform:translateY(0) scale(1);opacity:.95}
  50%{transform:translateY(-18px) scale(1.08);opacity:1}
}
@keyframes banIn{
  0%{transform:translate(-50%,-50%) scale(.6);opacity:0}
  100%{transform:translate(-50%,-50%) scale(1);opacity:1}
}
@keyframes clearPop{
  0%{transform:translate(-50%,-50%) scale(.35);opacity:0}
  55%{transform:translate(-50%,-50%) scale(1.06);opacity:1}
  100%{transform:translate(-50%,-50%) scale(1)}
}
@keyframes fall{
  0%{transform:translateY(-80px) rotate(0deg);opacity:0}
  10%{opacity:1}
  100%{transform:translateY(110vh) rotate(480deg);opacity:1}
}
@keyframes twinkle{
  0%,100%{transform:scale(.8) rotate(45deg);opacity:.45}
  50%{transform:scale(1.2) rotate(45deg);opacity:1}
}
</style>
</head>
<body>
<div class="stage" id="stage">
  <div class="scene">
    <div class="germ-wrap">
      <div class="germ">
        <div class="spike" style="transform:rotate(0deg)"></div>
        <div class="spike" style="transform:rotate(36deg)"></div>
        <div class="spike" style="transform:rotate(72deg)"></div>
        <div class="spike" style="transform:rotate(108deg)"></div>
        <div class="spike" style="transform:rotate(144deg)"></div>
        <div class="spike" style="transform:rotate(180deg)"></div>
        <div class="spike" style="transform:rotate(216deg)"></div>
        <div class="spike" style="transform:rotate(252deg)"></div>
        <div class="spike" style="transform:rotate(288deg)"></div>
        <div class="spike" style="transform:rotate(324deg)"></div>

        <div class="blob" style="width:36px;height:36px;left:58px;top:54px"></div>
        <div class="blob" style="width:24px;height:24px;left:160px;top:34px"></div>
        <div class="blob" style="width:26px;height:26px;right:72px;top:60px"></div>
        <div class="blob" style="width:28px;height:28px;left:114px;top:186px"></div>
        <div class="blob" style="width:22px;height:22px;left:204px;top:172px"></div>
        <div class="blob" style="width:36px;height:36px;right:64px;top:174px"></div>
        <div class="blob" style="width:26px;height:26px;left:136px;bottom:88px"></div>
        <div class="blob" style="width:32px;height:32px;right:104px;bottom:94px"></div>

        <div class="eye left">
          <div class="lid"></div>
          <div class="pupil"></div>
        </div>
        <div class="eye right">
          <div class="lid"></div>
          <div class="pupil"></div>
        </div>

        <div class="mouth-line"></div>
        <div class="mouth"></div>
        <div class="tooth-h"></div>
        <div class="tooth-v t1"></div>
        <div class="tooth-v t2"></div>
        <div class="tooth-v t3"></div>
      </div>
    </div>

    <div class="hand-zone">
      <div class="palm-foam"></div>
      <div class="palm-bubble pb1"></div>
      <div class="palm-bubble pb2"></div>
      <div class="palm-bubble pb3"></div>
      <div class="palm-bubble pb4"></div>
      <div class="palm-bubble pb5"></div>
      <div class="hand back">🤚</div>
      <div class="hand front">✋</div>
    </div>

    <div class="bubbles-layer" id="bubbleLayer"></div>
  </div>

  <div class="overlay" id="overlay">
    <div class="clear-wrap">
      <div class="ban-circle"></div>
      <div class="ban-line"></div>
      <div class="clear-text">CLEAR</div>
      <div class="thanks">경청해주셔서 감사합니다!</div>

      <div class="confetti-layer" id="confettiLayer"></div>

      <div class="spark s1"></div>
      <div class="spark s2"></div>
      <div class="spark s3"></div>
      <div class="spark s4"></div>
      <div class="spark s5"></div>
    </div>
  </div>
</div>

<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();
const stage = document.getElementById('stage');
const bubbleLayer = document.getElementById('bubbleLayer');
const overlay = document.getElementById('overlay');
const confettiLayer = document.getElementById('confettiLayer');

let endStarted = false;
let confettiBuilt = false;

function clearBubbles() {
  document.querySelectorAll('.bubble').forEach(el => el.remove());
}

function drawBubble(item) {
  const el = document.createElement('div');
  el.className = 'bubble';
  el.style.left = 'calc(' + item.x + '% - ' + (item.size / 2) + 'px)';
  el.style.top = 'calc(' + item.y + '% - ' + (item.size / 2) + 'px)';
  el.style.width = item.size + 'px';
  el.style.height = item.size + 'px';
  el.style.opacity = item.opacity;
  bubbleLayer.appendChild(el);
}

function buildConfetti() {
  if (confettiBuilt) return;
  confettiBuilt = true;

  const colors = ['#f3d45d','#d28cff','#5fd5ff','#f68cc8','#9fd37a','#8db9e8','#ffb7d9'];
  const types = ['dot','rect','ribbon'];

  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div');
    const type = types[i % types.length];
    el.className = 'confetti ' + type;
    el.style.left = (Math.random() * 100) + 'vw';
    el.style.animationDuration = (6 + Math.random() * 4) + 's';
    el.style.animationDelay = (Math.random() * 1.5) + 's';

    const color = colors[i % colors.length];

    if (type === 'ribbon') {
      el.style.color = color;
    } else {
      el.style.background = color;
    }

    if (type === 'rect') {
      el.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
    }

    confettiLayer.appendChild(el);
  }
}

function startEnding() {
  if (endStarted) return;
  endStarted = true;

  buildConfetti();
  stage.classList.add('end');
  overlay.classList.add('show');

  setTimeout(() => {
    overlay.classList.add('phase-confetti');
  }, 1200);

  setTimeout(() => {
    overlay.classList.add('phase-thanks');
  }, 2400);
}

function resetEnding() {
  endStarted = false;
  stage.classList.remove('end');
  overlay.classList.remove('show');
  overlay.classList.remove('phase-confetti');
  overlay.classList.remove('phase-thanks');
}

function render(data) {
  clearBubbles();
  data.bubbles.forEach(drawBubble);

  if (data.done) {
    startEnding();
  } else {
    resetEnding();
  }
}

socket.on('update', render);
</script>
</body>
</html>
  `);
});

app.get('/like', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>손위생 참여</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#f3f6f8;
  font-family:Arial,sans-serif;
  padding:20px;
}
.card{
  width:min(94vw,500px);
  background:#ffffff;
  border-radius:28px;
  box-shadow:0 12px 28px rgba(0,0,0,.08);
  padding:28px 22px 30px;
  text-align:center;
}
.drop-button{
  appearance:none;
  border:none;
  background:transparent;
  cursor:pointer;
  padding:0;
}
.drop-button:disabled{
  cursor:default;
}
.drop-wrap{
  position:relative;
  width:240px;
  height:300px;
  margin:0 auto 14px;
  display:flex;
  align-items:flex-start;
  justify-content:center;
}
.drop{
  position:relative;
  width:220px;
  height:260px;
  background:#8fc6df;
  border:8px solid #73bde0;
  border-radius:52% 52% 48% 48% / 62% 62% 38% 38%;
  transform:rotate(45deg);
  margin-top:6px;
  transition:transform .2s ease, box-shadow .2s ease, opacity .2s ease;
  box-shadow:0 10px 22px rgba(115,189,224,.25);
}
.drop-button:hover .drop{
  transform:rotate(45deg) scale(1.03);
}
.drop-button:active .drop{
  transform:rotate(45deg) scale(.98);
}
.drop-face{
  position:absolute;
  inset:0;
  transform:rotate(-45deg);
}
.drop-eye{
  position:absolute;
  top:90px;
  width:16px;
  height:16px;
  border-radius:50%;
  background:#0a5575;
}
.drop-eye.left{left:82px}
.drop-eye.right{right:82px}
.drop-mouth{
  position:absolute;
  left:50%;
  top:122px;
  transform:translateX(-50%);
  width:58px;
  height:26px;
  border-bottom:8px solid #0a5575;
  border-radius:0 0 40px 40px;
}
.arm{
  position:absolute;
  width:22px;
  height:54px;
  background:#8fc6df;
  border:8px solid #73bde0;
  border-radius:20px;
}
.arm.left{
  left:-6px;
  top:145px;
  transform:rotate(32deg);
}
.arm.right{
  right:-6px;
  top:145px;
  transform:rotate(-32deg);
}
.leg{
  position:absolute;
  width:22px;
  height:42px;
  background:#8fc6df;
  border:8px solid #73bde0;
  border-radius:20px;
  bottom:-12px;
}
.leg.left{left:78px}
.leg.right{right:78px}
.title{
  font-size:30px;
  font-weight:900;
  color:#0a5575;
  margin:8px 0 10px;
  letter-spacing:-1px;
}
.count{
  font-size:18px;
  color:#111;
  font-weight:800;
  margin-top:12px;
}
.status{
  margin-top:14px;
  min-height:28px;
  font-size:22px;
  font-weight:900;
  color:#0b5d7a;
}
.done .drop{
  opacity:.72;
}
.done .title{
  color:#0b5d7a;
}
.done .status{
  color:#0b5d7a;
}
</style>
</head>
<body>
  <div class="card" id="card">
    <button class="drop-button" id="dropBtn" onclick="joinNow()">
      <div class="drop-wrap">
        <div class="drop">
          <div class="drop-face">
            <div class="arm left"></div>
            <div class="arm right"></div>
            <div class="leg left"></div>
            <div class="leg right"></div>
            <div class="drop-eye left"></div>
            <div class="drop-eye right"></div>
            <div class="drop-mouth"></div>
          </div>
        </div>
      </div>
    </button>

    <div class="title" id="title">물방울을 눌러주세요.</div>
    <div class="count" id="countText">참여: 0명   목표: 30명</div>
    <div class="status" id="status"></div>
  </div>

<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();
const card = document.getElementById('card');
const dropBtn = document.getElementById('dropBtn');
const titleEl = document.getElementById('title');
const countEl = document.getElementById('countText');
const statusEl = document.getElementById('status');

function setDoneUI(data){
  card.classList.add('done');
  dropBtn.disabled = true;
  titleEl.textContent = '물방울을 눌러주세요.';
  countEl.textContent = '참여: ' + data.target + '명   목표: ' + data.target + '명';
  statusEl.textContent = '감염예방 완료!';
}

function setActiveUI(data){
  card.classList.remove('done');
  dropBtn.disabled = false;
  titleEl.textContent = '물방울을 눌러주세요.';
  countEl.textContent = '참여: ' + data.count + '명   목표: ' + data.target + '명';
  statusEl.textContent = '';
}

async function joinNow() {
  if (dropBtn.disabled) return;

  try {
    const res = await fetch('/like-click', { method: 'POST' });
    const data = await res.json();

    if (data.done) {
      setDoneUI(data);
    } else {
      countEl.textContent = '참여: ' + data.count + '명   목표: ' + data.target + '명';
      statusEl.textContent = '참여해주셔서 감사합니다!';
      setTimeout(() => {
        if (!dropBtn.disabled) statusEl.textContent = '';
      }, 1200);
    }
  } catch (e) {
    statusEl.textContent = '오류가 발생했습니다.';
  }
}

socket.on('update', data => {
  if (data.done) {
    setDoneUI(data);
  } else {
    setActiveUI(data);
  }
});
</script>
</body>
</html>
  `);
});

app.post('/like-click', (req, res) => {
  if (count >= TARGET_COUNT) {
    return res.json({
      ok: true,
      count: TARGET_COUNT,
      target: TARGET_COUNT,
      done: true
    });
  }

  count++;
  bubbles.push(makeBubble());

  if (count > TARGET_COUNT) count = TARGET_COUNT;

  emitState();

  res.json({
    ok: true,
    count,
    target: TARGET_COUNT,
    done: count >= TARGET_COUNT
  });
});

app.post('/reset', (req, res) => {
  count = 0;
  bubbles = [];
  nextId = 1;
  emitState();
  res.json({ ok: true });
});

io.on('connection', socket => {
  socket.emit('update', payload());
});

server.listen(PORT, () => {
  console.log('실행중');
  console.log('큰화면 http://localhost:3001/screen');
  console.log('참여화면 http://localhost:3001/like');
});