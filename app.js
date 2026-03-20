/* ── State ───────────────────────────────────────────── */
let picks = {};          // { num: playerName }
let winHistory = {};     // { num: count } – how many times each number has won
let players = {};        // { name: { points, wins } }
let currentRound = 1;
let drawing = false;

/* ── Helpers ─────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Init ────────────────────────────────────────────── */
function init() {
  document.getElementById('total-rounds').textContent = CONFIG.totalRounds;
  buildGrid();
  setupTabs();
}

function buildGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let i = 1; i <= CONFIG.totalNumbers; i++) {
    const div = document.createElement('div');
    div.className = 'num';
    div.id = `num-${i}`;
    div.dataset.num = i;
    div.textContent = i;
    renderHotColdBadge(div, i);
    div.onclick = () => pickNumber(i, div);
    grid.appendChild(div);
  }
}

/* ── Tabs ────────────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');

      if (btn.dataset.tab === 'stats') renderStats();
      if (btn.dataset.tab === 'ranking') renderRanking();
    });
  });
}

/* ── Pick number ─────────────────────────────────────── */
function pickNumber(num, el) {
  if (drawing) return;
  const name = document.getElementById('name').value.trim();
  if (!name) return alert('Ingresá tu nombre primero');
  if (picks[num]) return alert(`El número ${num} ya está tomado por ${picks[num]}`);

  picks[num] = name;
  el.classList.add('taken');

  const numSpan = document.createElement('span');
  numSpan.textContent = num;
  const nameSpan = document.createElement('small');
  nameSpan.textContent = name;
  el.innerHTML = '';
  el.appendChild(numSpan);
  el.appendChild(document.createElement('br'));
  el.appendChild(nameSpan);

  if (!players[name]) players[name] = { points: 0, wins: 0 };
  players[name].points += CONFIG.pointsPerPick;

  checkVip(name);
  log(`✔ <b>${escHtml(name)}</b> eligió el número <b>${escHtml(String(num))}</b>`);
}

/* ── VIP check ───────────────────────────────────────── */
function checkVip(name) {
  const badge = document.getElementById('vip-badge');
  if (players[name] && players[name].points >= CONFIG.vipThreshold) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

/* ── Casino draw animation ───────────────────────────── */
function startDraw() {
  if (drawing) return;
  if (Object.keys(picks).length < CONFIG.minPlayers) {
    return alert(`Necesitás al menos ${CONFIG.minPlayers} jugadores`);
  }

  drawing = true;
  document.getElementById('btn-draw').disabled = true;
  document.getElementById('drum').classList.remove('hidden');

  const pickedNums = Object.keys(picks).map(Number);
  const allNums = Array.from({ length: CONFIG.totalNumbers }, (_, i) => i + 1);
  const winner = pickedNums[Math.floor(Math.random() * pickedNums.length)];

  log('🚀 Sorteo iniciado — ¡buena suerte a todos!');

  let elapsed = 0;
  let currentIdx = 0;
  let speed = CONFIG.drawSpeed;
  const drum = document.getElementById('drum-number');

  // Spin through all numbers, then slow down toward winner
  const spin = () => {
    // Remove previous highlight
    document.querySelectorAll('.num.highlight').forEach(el => el.classList.remove('highlight'));

    const num = allNums[currentIdx % allNums.length];
    drum.textContent = num;

    const el = document.getElementById(`num-${num}`);
    if (el) el.classList.add('highlight');

    currentIdx++;
    elapsed += speed;

    // Slow down in final phase
    if (elapsed > CONFIG.animDuration * 0.6) {
      speed = Math.min(speed * 1.08, 600);
    }

    if (elapsed < CONFIG.animDuration) {
      setTimeout(spin, speed);
    } else {
      finalizeDraw(winner, drum);
    }
  };

  spin();
}

function finalizeDraw(winner, drum) {
  // Clear all highlights
  document.querySelectorAll('.num.highlight').forEach(el => el.classList.remove('highlight'));

  // Land on winner
  drum.textContent = winner;
  const winnerEl = document.getElementById(`num-${winner}`);
  if (winnerEl) winnerEl.classList.add('winner-num');

  const winnerName = picks[winner];

  // Update stats
  winHistory[winner] = (winHistory[winner] || 0) + 1;
  if (!players[winnerName]) players[winnerName] = { points: 0, wins: 0 };
  players[winnerName].points += CONFIG.pointsPerWin;
  players[winnerName].wins += 1;

  log(`🏆 <b>GANADOR: ${escHtml(winnerName)}</b> — número <b>${escHtml(String(winner))}</b>`);

  // Show overlay
  document.getElementById('winner-text').innerHTML =
    `🎉 ${escHtml(winnerName)}<br><span style="font-size:1rem;color:#fff">eligió el número ${escHtml(String(winner))}</span>`;
  document.getElementById('winner-overlay').classList.remove('hidden');

  // Update grid hot/cold badges
  for (let i = 1; i <= CONFIG.totalNumbers; i++) {
    const el = document.getElementById(`num-${i}`);
    if (el) renderHotColdBadge(el, i);
  }

  // Advance round
  if (currentRound < CONFIG.totalRounds) {
    currentRound++;
    document.getElementById('round-badge').textContent =
      `Ronda ${currentRound} / ${CONFIG.totalRounds}`;
  } else {
    log('🏁 <b>¡Torneo finalizado!</b> Revisá el ranking.');
    document.getElementById('btn-draw').textContent = '🏁 Torneo completo';
  }

  document.getElementById('drum').classList.add('hidden');
  document.getElementById('btn-draw').disabled = false;
  drawing = false;

  // Notify OBS overlay via localStorage
  try {
    localStorage.setItem('sorteo_winner', JSON.stringify({
      name: winnerName,
      number: winner,
      round: currentRound,
      ts: Date.now()
    }));
    localStorage.setItem('sorteo_picks', JSON.stringify(picks));
  } catch (_) {}
}

/* ── Hot / Cold badges ───────────────────────────────── */
function renderHotColdBadge(el, num) {
  el.querySelectorAll('.badge').forEach(b => b.remove());
  const wins = winHistory[num] || 0;
  if (wins >= CONFIG.hotThreshold) {
    const b = document.createElement('span');
    b.className = 'badge badge-hot';
    b.textContent = '🔥';
    el.appendChild(b);
  } else if (wins === 0 && Object.keys(winHistory).length > 0) {
    const b = document.createElement('span');
    b.className = 'badge badge-cold';
    b.textContent = '❄️';
    el.appendChild(b);
  }
}

/* ── Stats tab ───────────────────────────────────────── */
function renderStats() {
  const sorted = Array.from({ length: CONFIG.totalNumbers }, (_, i) => i + 1)
    .map(n => ({ num: n, wins: winHistory[n] || 0 }))
    .sort((a, b) => b.wins - a.wins);

  const hot = sorted.filter(n => n.wins >= CONFIG.hotThreshold);
  const cold = sorted.filter(n => n.wins === 0);

  renderStatGrid('stats-grid', hot.length ? hot : sorted.slice(0, 5), 'hot-cell');
  renderStatGrid('cold-grid', cold.slice(0, 10), 'cold-cell');
}

function renderStatGrid(id, items, cls) {
  const el = document.getElementById(id);
  el.innerHTML = items.length
    ? items.map(n => `
        <div class="stat-cell ${cls}">
          <div class="stat-num">${n.num}</div>
          <div class="stat-label">${n.wins} victoria${n.wins !== 1 ? 's' : ''}</div>
        </div>`).join('')
    : '<p style="color:#64748b;padding:16px">Sin datos aún</p>';
}

/* ── Ranking tab ─────────────────────────────────────── */
function renderRanking() {
  const tbody = document.getElementById('ranking-body');
  const sorted = Object.entries(players)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.points - a.points);

  if (!sorted.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:#64748b;padding:16px">Aún no hay jugadores</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map((p, i) => {
    const isVip = p.points >= CONFIG.vipThreshold;
    return `<tr class="${isVip ? 'vip-row' : ''}">
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.points}</td>
      <td>${p.wins}</td>
      <td>${isVip ? '⭐ VIP' : '—'}</td>
    </tr>`;
  }).join('');
}

/* ── Resets ──────────────────────────────────────────── */
function resetRound() {
  if (drawing) return;
  picks = {};
  buildGrid();
  document.getElementById('log').innerHTML = '';
  log('🔄 Nueva ronda lista');
  try { localStorage.removeItem('sorteo_picks'); } catch (_) {}
}

function fullReset() {
  if (!confirm('¿Reiniciar el torneo completo? Se borran puntos y stats.')) return;
  picks = {};
  winHistory = {};
  players = {};
  currentRound = 1;
  drawing = false;
  document.getElementById('round-badge').textContent = `Ronda 1 / ${CONFIG.totalRounds}`;
  document.getElementById('btn-draw').textContent = '🚀 INICIAR SORTEO';
  document.getElementById('btn-draw').disabled = false;
  buildGrid();
  document.getElementById('log').innerHTML = '';
  log('⛔ Torneo reiniciado');
  try {
    localStorage.removeItem('sorteo_picks');
    localStorage.removeItem('sorteo_winner');
  } catch (_) {}
}

function closeWinner() {
  document.getElementById('winner-overlay').classList.add('hidden');
}

/* ── Log — msg must use only trusted internal HTML markup ── */
function log(msg) {
  const logDiv = document.getElementById('log');
  const ts = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  logDiv.innerHTML += `<span style="color:#64748b">${ts}</span> ${msg}<br>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}

init();
