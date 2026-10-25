/* Browser shell for the hotel13 headless core. */
(function () {
  'use strict';
  const C = window.Hotel13Core;
  const $ = (id) => document.getElementById(id);
  const app = $('app');
  const overlay = $('overlay');
  const overlayCard = $('overlayCard');
  const choicesEl = $('choices');
  const feedbackEl = $('feedback');
  const primaryEl = $('primary');

  let game = C.createGame(1);
  let snap = null;
  let lastOrder = 50;
  let audio = null;

  // ambient bubbles
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('i');
    b.className = 'bubble';
    const size = 4 + (i % 7) * 3;
    b.style.cssText = `width:${size}px;height:${size}px;left:${(i * 53 + 13) % 960}px;bottom:-20px;animation-duration:${9 + (i % 6) * 2}s;animation-delay:${-i * 1.7}s;opacity:${0.08 + (i % 4) * 0.03}`;
    app.appendChild(b);
  }

  function ensureAudio() {
    if (!audio) {
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { audio = null; }
    }
    if (audio && audio.state === 'suspended') audio.resume().catch(() => {});
    ensureBgm();
  }
  function tone(freq, dur, type, gain, slide) {
    if (!audio) return;
    try {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, audio.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), audio.currentTime + dur);
      g.gain.setValueAtTime(0.0001, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(gain || .04, audio.currentTime + .01);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + dur + .02);
    } catch (_) {}
  }
  function sfx(kind) {
    ensureAudio();
    if (kind === 'correct') { tone(660, .12, 'sine', .04, 220); tone(990, .1, 'sine', .025, 120); }
    else if (kind === 'wrong') { tone(120, .3, 'triangle', .06, -50); }
    else if (kind === 'event') { tone(520, .08, 'sine', .025, 120); }
    else if (kind === 'door') { tone(160, .18, 'triangle', .035, -40); }
    else { tone(420, .08, 'sine', .025, 80); }
  }

  // ---------------------------------------------------------------- BGM
  // 两首循环曲：日常夜用 night.ogg，停靠 13F 时交叉淡入 floor13.ogg。
  // 浏览器不允许自动播放，所以由第一次点击（ensureAudio）唤起。
  const bgmState = { on: true, mode: null, timer: null };
  const bgmVol = { night: .55, f13: .5 };

  function bgmEls() { return { night: $('bgmNight'), f13: $('bgm13') }; }

  function fadeBgm(mode) {
    const els = bgmEls();
    if (!els.night || !els.f13) return;
    clearInterval(bgmState.timer);
    const target = {}; for (const k in els) target[k] = bgmState.on && k === mode ? bgmVol[k] : 0;
    els[mode].play().catch(() => {});
    let guard = 0;
    bgmState.timer = setInterval(() => {
      let done = true;
      for (const k in els) {
        const el = els[k], t = target[k], d = t - el.volume;
        if (Math.abs(d) > 0.02) { el.volume = Math.min(1, Math.max(0, el.volume + d * 0.28)); done = false; }
        else el.volume = t;
        if (el.volume === 0 && k !== mode && !el.paused) el.pause();
      }
      if (done || ++guard > 120) clearInterval(bgmState.timer);
    }, 55);
  }

  function ensureBgm() {
    if (!bgmState.mode) bgmState.mode = 'night';
    if (!bgmState.on) return;
    const el = bgmEls()[bgmState.mode];
    if (!el) return;
    // The title screen may have tried to play before the first user gesture;
    // retry here, after the click that unlocks audio.
    if (el.paused) el.play().catch(() => {});
    fadeBgm(bgmState.mode);
  }

  function setMood(is13) {
    const want = is13 ? 'f13' : 'night';
    if (bgmState.mode === want) return;
    bgmState.mode = want;
    if (bgmState.on) fadeBgm(want);
  }

  $('bgmBtn').addEventListener('click', () => {
    bgmState.on = !bgmState.on;
    $('bgmBtn').classList.toggle('off', !bgmState.on);
    $('bgmBtn').textContent = bgmState.on ? '♪ BGM' : '♪ 静音';
    ensureAudio();
    fadeBgm(bgmState.mode || 'night');
  });

  // ------------------------------------------------------------- 立绘
  // 一客一图：客人名 → 图片。13F 相关的三个（没有客人 / 门外的声音 / 13 楼的门）用 s03。
  const NPC_ART = {
    '戴帽子的先生': 'npc/gentleman-hat',
    '没有影子的老太太': 'npc/old-lady',
    '抱鱼缸的女孩': 'npc/fishbowl-girl',
    '没有影子的小孩': 'npc/shadowless-kid',
    '抱伞的女士': 'npc/umbrella-lady',
    '第二位客人': 'npc/second-guest',
    '没有影子的男人': 'npc/shadowless-man',
    '捂着脸的客人': 'npc/covered-face',
    '抱枕头的老先生': 'npc/pillow-oldman',
    '没有影子的女人': 'npc/shadowless-woman',
    '没有影子的客人': 's05',          // 就是「无影客人」本人
    '拿错房卡的先生': 'npc/wrong-card-man',
    '穿雨衣的客人': 'npc/raincoat',
    '没有影子的服务生': 'npc/bellboy',
    '拿 13F 房卡的客人': 'npc/card-13f',
    '抱被子的女孩': 'npc/blanket-girl',
    '没有客人': 's03',
    '门外的声音': 's03',
    '13 楼的门': 's03',
  };

  function portraitFor(e) {
    if (!e) return null;
    const direct = NPC_ART[e.guest];
    if (direct) return direct;
    // 兜底：没登记的客人按 13F / 有无影子选
    if (String(e.floor).indexOf('13') >= 0) return 's03';
    return e.shadow ? 's04' : 's05';
  }

  function setArt(e) {
    const art = $('guestArt');
    if (!art) return;
    const name = portraitFor(e);
    if (!name) { art.classList.remove('show'); return; }
    const src = 'assets/' + name + '.png';
    if (art.getAttribute('src') !== src) {
      art.classList.remove('show');
      art.setAttribute('src', src);
      void art.offsetWidth;
    }
    requestAnimationFrame(() => art.classList.add('show'));
  }

  function overlayCardHtml(html, buttonId, label) {
    overlayCard.innerHTML = html + `<button class="primary" id="${buttonId}">${label}</button>`;
    overlay.classList.add('show');
    const btn = document.getElementById(buttonId);
    if (btn) btn.onclick = onOverlayButton;
    requestAnimationFrame(() => { if (btn) btn.focus(); });
  }

  function showTitle() {
    setMood(false); setArt(null);
    overlayCardHtml(
      `<small>鲸鲸的深海旅馆 · 夜班</small>
       <h1>13 楼<br>没有客人</h1>
       <p>本店没有 13 楼。<br>可今晚，13 楼的按钮自己亮了。</p>
       <p>你是夜班电梯员。看规则，看影子，别让“不是客人”的东西进来。</p>
       <div class="kbd">鼠标点击，或按 1 / 2 / 3 选择 · Enter 继续</div>`,
      'startBtn', '开始值班'
    );
  }

  function onOverlayButton() {
    ensureAudio();
    if (snap && snap.mode === 'ending') {
      game = C.createGame(1);
      snap = C.snapshot(game);
      showTitle();
      return;
    }
    C.start(game);
    snap = C.snapshot(game);
    render();
  }

  function renderNight() {
    setMood(false); setArt(null);
    const n = snap;
    const rules = n.rules.map(r => `<div class="rule"><i>·</i>${r.text}</div>`).join('');
    overlayCardHtml(
      `<small>${n.nightTitle}</small>
       <h2>${n.nightTitle}</h2>
       <p>${n.nightIntro}</p>
       <div class="rules-title" style="margin-top:14px">今夜规则</div>
       ${rules}
       <div class="kbd">按 Enter 或点按钮开始这一夜</div>`,
      'nightBtn', '开始这一夜'
    );
    const btn = document.getElementById('nightBtn');
    if (btn) btn.onclick = () => { ensureAudio(); C.beginNight(game); snap = C.snapshot(game); render(); };
  }

  function renderEnding() {
    setMood(false); setArt(null);
    const e = snap.ending;
    overlayCardHtml(
      `<small>值班结束</small>
       <h2>${e.title}</h2>
       <p>${e.text}</p>
       <p>秩序 ${snap.order} · 真相 ${snap.truth}/5 · 完成 ${snap.history.length} 次停靠</p>`,
      'restartBtn', '再值一班'
    );
    const btn = document.getElementById('restartBtn');
    if (btn) btn.onclick = onOverlayButton;
  }

  function renderEvent() {
    overlay.classList.remove('show');
    const e = snap.event;
    $('meta').textContent = `第 ${snap.night} 夜 · 停靠 ${snap.stop}/${snap.stops}`;
    $('floorDisplay').textContent = e.floor.includes('13') ? '13F' : e.floor;
    $('floorChip').textContent = e.floor;
    $('floorChip').className = 'chip' + (e.floor.includes('13') ? ' danger' : '');
    $('shadowChip').textContent = e.shadow ? '影子：有' : '影子：无';
    $('shadowChip').className = 'chip' + (e.shadow ? '' : ' danger');
    $('guest').textContent = e.guest;
    $('line').textContent = e.line;
    $('hint').textContent = e.floor.includes('13') ? '13F 的按钮在发烫。' : '先看规则，再决定开不开门。';
    $('thirteen').classList.toggle('lit', e.floor.includes('13'));
    $('doors').classList.remove('open');
    $('rules').innerHTML = snap.rules.map(r => `<div class="rule"><i>·</i>${r.text}</div>`).join('');
    $('orderNum').textContent = snap.order;
    $('orderBar').style.width = Math.max(2, snap.order) + '%';
    choicesEl.innerHTML = e.choices.map((c, i) =>
      `<button class="choice" data-choice="${c.id}"><b>${i + 1}</b>${c.label}</button>`
    ).join('');
    choicesEl.style.display = 'grid';
    feedbackEl.innerHTML = '';
    primaryEl.style.display = 'none';
    setMood(e.floor.indexOf('13') >= 0);
    setArt(e);
    sfx('event');
  }

  function renderFeedback() {
    const e = snap.event;
    const l = snap.last;
    $('meta').textContent = `第 ${snap.night} 夜 · 停靠 ${snap.stop}/${snap.stops}`;
    $('floorDisplay').textContent = e.floor.includes('13') ? '13F' : e.floor;
    $('thirteen').classList.toggle('lit', e.floor.includes('13'));
    $('orderNum').textContent = snap.order;
    $('orderBar').style.width = Math.max(2, snap.order) + '%';
    $('doors').classList.toggle('open', l.choiceId === 'open');
    choicesEl.style.display = 'none';
    feedbackEl.innerHTML = `<div class="feedback ${l.correct ? 'good' : 'bad'}">
      ${l.correct ? '判断正确。' : '判断错误。'}<br>${l.reply || ''}
      <br><span class="kbd">秩序 ${l.order} · 真相 ${l.truth}/5</span>
    </div>`;
    primaryEl.textContent = '继续';
    primaryEl.style.display = 'inline-block';
    primaryEl.onclick = () => { C.next(game); snap = C.snapshot(game); render(); };
    setMood(e.floor.indexOf('13') >= 0);
    setArt(e);
    if (l.choiceId === 'open') sfx('door');
  }

  function render() {
    snap = C.snapshot(game);
    if (snap.mode === 'title') { showTitle(); return; }
    if (snap.mode === 'ending' || snap.phase === 'ending') { renderEnding(); return; }
    if (snap.phase === 'night') { renderNight(); return; }
    if (snap.phase === 'event') { renderEvent(); return; }
    if (snap.phase === 'feedback') { renderFeedback(); return; }
  }

  function choose(id) {
    if (!snap || snap.phase !== 'event') return;
    lastOrder = snap.order;
    const res = C.choose(game, id);
    if (!res.ok) return;
    sfx(res.correct ? 'correct' : 'wrong');
    snap = C.snapshot(game);
    render();
  }

  choicesEl.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-choice]');
    if (btn) choose(btn.dataset.choice);
  });
  primaryEl.addEventListener('click', () => {
    if (snap && snap.phase === 'feedback') { C.next(game); snap = C.snapshot(game); render(); }
  });

  document.addEventListener('keydown', (ev) => {
    if (overlay.classList.contains('show')) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        const btn = overlay.querySelector('button');
        if (btn) { ev.preventDefault(); btn.click(); }
      }
      return;
    }
    if (snap && snap.phase === 'event' && /^[123]$/.test(ev.key)) {
      const c = snap.event.choices[Number(ev.key) - 1];
      if (c) choose(c.id);
    } else if (snap && snap.phase === 'feedback' && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault();
      C.next(game); snap = C.snapshot(game); render();
    }
  });

  window.__hotel13 = {
    core: C,
    getGame: () => game,
    getSnap: () => snap,
    choose,
    advance: () => { C.next(game); snap = C.snapshot(game); render(); },
    render,
  };

  showTitle();
})();
