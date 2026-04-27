// ===========================
// ui.js - UI 渲染 & 元件
// ===========================

// ---- Toast 通知 ----
function showToast(msg, type = 'default', duration = 2800) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', default: '🌸' };
  el.innerHTML = `<span>${icons[type] || '🌸'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ---- Loading bar ----
function setLoading(on) {
  let bar = document.getElementById('loadingBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'loadingBar';
    bar.className = 'loading-bar';
    document.body.prepend(bar);
  }
  bar.classList.toggle('active', on);
}

// ---- Sync Status ----
function setSyncStatus(state) {
  // state: 'disconnected' | 'connected' | 'syncing' | 'error'
  const el = document.getElementById('syncStatus');
  const txt = el.querySelector('.sync-text');
  el.className = 'sync-status ' + state;
  const labels = {
    disconnected: '未連線 Google Sheets',
    connected: '已連線 ✓',
    syncing: '同步中...',
    error: '同步失敗',
  };
  txt.textContent = labels[state] || state;
}

// ---- 建立 Section HTML ----
function buildSections() {
  const main = document.querySelector('.main-grid');
  main.innerHTML = '';
  CONFIG.CATEGORIES.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'section-card';
    section.dataset.cat = cat;
    section.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <span class="section-emoji">${CONFIG.CATEGORY_EMOJI[cat]}</span>
          <span class="section-name">${cat}</span>
        </div>
        <span class="section-completion" id="comp-${cat}">0 / 0</span>
      </div>
      <div class="add-goal-area">
        <div class="goal-input-wrap">
          <input type="text" class="goal-name-input" placeholder="新增目標..." data-cat="${cat}" />
          <select class="priority-select" data-cat="${cat}">
            <option value="高">🔴 高</option>
            <option value="中" selected>🟡 中</option>
            <option value="低">🟢 低</option>
          </select>
        </div>
        <button class="btn-add" data-cat="${cat}">＋ 新增</button>
      </div>
      <div class="goals-list" id="list-${cat}">
        <div class="empty-state">
          <span class="empty-state-emoji">🌱</span>
          還沒有目標，加一個吧！
        </div>
      </div>
    `;
    main.appendChild(section);
  });
}

// ---- 建立單一 Goal Card ----
function buildGoalCard(goal, todayIds = []) {
  const card = document.createElement('div');
  card.className = 'goal-card';
  card.dataset.id = goal.id;
  card.dataset.priority = goal.priority || '中';

  if (goal.completed) card.classList.add('completed');
  if (isStale(goal)) card.classList.add('stale');
  if (todayIds.includes(goal.id)) card.classList.add('today-pick');

  const prog = Number(goal.progress) || 0;
  const progClass = prog >= 100 ? 'full' : prog >= 60 ? 'high' : '';

  card.innerHTML = `
    <div class="goal-top">
      <div class="goal-checkbox-wrap">
        <input type="checkbox" class="goal-checkbox" id="cb-${goal.id}" ${goal.completed ? 'checked' : ''} />
        <label class="checkbox-visual" for="cb-${goal.id}"></label>
      </div>
      <div class="goal-info">
        <div class="goal-title">${escapeHtml(goal.title)}</div>
        <div class="goal-meta">
          <span class="priority-badge ${goal.priority || '中'}">${goal.priority || '中'}</span>
          <span class="goal-date">${formatDate(goal.created_at)}</span>
        </div>
      </div>
      <button class="btn-delete-goal" data-id="${goal.id}" title="刪除">✕</button>
    </div>
    <div class="goal-progress">
      <div class="progress-top">
        <span class="progress-label">進度</span>
        <span class="progress-num ${progClass}" id="num-${goal.id}">${prog}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="fill-${goal.id}" style="width:${prog}%"></div>
      </div>
      <input type="range" min="0" max="100" value="${prog}" class="progress-slider" data-id="${goal.id}" />
      <div class="complete-hint ${prog >= 100 ? 'visible' : ''}" id="hint-${goal.id}">🎉 太棒了！可以勾選完成囉！</div>
    </div>
  `;
  return card;
}

// ---- 渲染某個 section ----
function renderSection(cat, goals, todayIds = []) {
  const list = document.getElementById(`list-${cat}`);
  const catGoals = goals.filter(g => g.category === cat);
  const active = catGoals.filter(g => !g.completed)
    .sort((a, b) => {
      const p = { '高': 0, '中': 1, '低': 2 };
      return (p[a.priority] || 1) - (p[b.priority] || 1) || new Date(a.created_at) - new Date(b.created_at);
    });
  const done = catGoals.filter(g => g.completed);

  list.innerHTML = '';
  if (catGoals.length === 0) {
    list.innerHTML = `<div class="empty-state"><span class="empty-state-emoji">🌱</span>還沒有目標，加一個吧！</div>`;
  } else {
    [...active, ...done].forEach(g => list.appendChild(buildGoalCard(g, todayIds)));
  }

  // 更新完成率
  const comp = document.getElementById(`comp-${cat}`);
  if (comp) comp.textContent = `${done.length} / ${catGoals.length}`;
}

// ---- 更新整體統計 ----
function updateStats(goals) {
  const total = goals.length;
  const done = goals.filter(g => g.completed).length;
  const avgProg = total === 0 ? 0 : Math.round(goals.reduce((s, g) => s + (Number(g.progress) || 0), 0) / total);
  document.getElementById('totalGoals').textContent = total;
  document.getElementById('completedGoals').textContent = done;
  document.getElementById('overallProgress').textContent = avgProg + '%';
}

// ---- 渲染「今日3件事」 ----
function renderToday(goals, todayIds) {
  const banner = document.getElementById('todayBanner');
  const container = document.getElementById('todayItems');
  const picks = goals.filter(g => todayIds.includes(g.id) && !g.completed);
  container.innerHTML = '';
  if (picks.length === 0) { banner.classList.remove('has-items'); return; }
  banner.classList.add('has-items');
  picks.forEach(g => {
    const item = document.createElement('div');
    item.className = 'today-item';
    item.innerHTML = `
      <span class="today-item-cat">${CONFIG.CATEGORY_EMOJI[g.category]} ${g.category}</span>
      <span>${escapeHtml(g.title)}</span>
    `;
    container.appendChild(item);
  });
}

// ---- 選出今日3件事 ----
function pickToday(goals) {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(CONFIG.TODAY_PICK_DATE_KEY);
  if (savedDate === today) {
    const saved = JSON.parse(localStorage.getItem(CONFIG.TODAY_PICK_KEY) || '[]');
    // 驗證這些 id 還存在
    const validIds = goals.map(g => g.id);
    const stillValid = saved.filter(id => validIds.includes(id));
    if (stillValid.length === 3) return stillValid;
  }
  // 重新選: 未完成 + 優先高的先入選
  const active = goals.filter(g => !g.completed);
  if (active.length === 0) return [];
  const high = active.filter(g => g.priority === '高');
  const mid = active.filter(g => g.priority === '中');
  const low = active.filter(g => g.priority === '低');
  const pool = shuffle([...high]).concat(shuffle([...mid])).concat(shuffle([...low]));
  const picks = pool.slice(0, 3).map(g => g.id);
  localStorage.setItem(CONFIG.TODAY_PICK_KEY, JSON.stringify(picks));
  localStorage.setItem(CONFIG.TODAY_PICK_DATE_KEY, today);
  return picks;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
