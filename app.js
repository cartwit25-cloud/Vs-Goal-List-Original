// ===========================
// app.js - 主邏輯
// ===========================

let goals = [];
let todayIds = [];

// ---- 初始化 ----
async function init() {
  buildSections();
  await loadGoals();
  bindGlobalEvents();
}

// ---- 載入資料 ----
async function loadGoals() {
  setLoading(true);
  try {
    if (getWebAppUrl()) {
      setSyncStatus('syncing');
      const remote = await API.fetchAll();
      if (remote !== null) {
        goals = remote;
        saveLocal(goals);
        setSyncStatus('connected');
      } else {
        goals = loadLocal();
        setSyncStatus('disconnected');
      }
    } else {
      goals = loadLocal();
      setSyncStatus('disconnected');
    }
  } catch (e) {
    console.error('載入失敗', e);
    goals = loadLocal();
    setSyncStatus('error');
    showToast('無法連線 Google Sheets，使用本地資料', 'error');
  }
  setLoading(false);
  todayIds = pickToday(goals);
  renderAll();
}

// ---- 全部渲染 ----
function renderAll() {
  CONFIG.CATEGORIES.forEach(cat => renderSection(cat, goals, todayIds));
  updateStats(goals);
  renderToday(goals, todayIds);
}

// ---- 新增目標 ----
async function addGoal(cat, title, priority) {
  if (!title.trim()) { showToast('請輸入目標名稱 🌸', 'info'); return; }
  const goal = {
    id: genId(),
    category: cat,
    title: title.trim(),
    progress: 0,
    completed: false,
    priority: priority || '中',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  goals.push(goal);
  saveLocal(goals);
  renderAll();
  todayIds = pickToday(goals);
  renderToday(goals, todayIds);

  // 同步到 Sheets
  if (getWebAppUrl()) {
    setSyncStatus('syncing');
    try {
      await API.addGoal(goal);
      setSyncStatus('connected');
      showToast('✅ 已同步到 Google Sheets', 'success');
    } catch (e) {
      setSyncStatus('error');
      showToast('同步失敗，已存在本地', 'error');
    }
  } else {
    showToast('目標已新增 🎯', 'success');
  }
}

// ---- 更新目標 ----
async function updateGoal(id, changes) {
  const idx = goals.findIndex(g => g.id === id);
  if (idx < 0) return;
  goals[idx] = { ...goals[idx], ...changes, updated_at: new Date().toISOString() };
  saveLocal(goals);
  renderAll();
  todayIds = pickToday(goals);
  renderToday(goals, todayIds);

  if (getWebAppUrl()) {
    setSyncStatus('syncing');
    try {
      await API.updateGoal(goals[idx]);
      setSyncStatus('connected');
    } catch (e) {
      setSyncStatus('error');
      showToast('同步失敗', 'error');
    }
  }
}

// ---- 刪除目標 ----
async function deleteGoal(id) {
  if (!confirm('確定要刪除這個目標嗎？')) return;
  goals = goals.filter(g => g.id !== id);
  saveLocal(goals);
  renderAll();
  todayIds = pickToday(goals);
  renderToday(goals, todayIds);

  if (getWebAppUrl()) {
    setSyncStatus('syncing');
    try {
      await API.deleteGoal(id);
      setSyncStatus('connected');
      showToast('已刪除', 'info');
    } catch (e) {
      setSyncStatus('error');
      showToast('刪除同步失敗', 'error');
    }
  } else {
    showToast('已刪除', 'info');
  }
}

// ---- 事件綁定（事件委派） ----
function bindGlobalEvents() {

  // 新增按鈕
  document.querySelector('.main-grid').addEventListener('click', e => {
    const btn = e.target.closest('.btn-add');
    if (!btn) return;
    const cat = btn.dataset.cat;
    const input = document.querySelector(`.goal-name-input[data-cat="${cat}"]`);
    const sel = document.querySelector(`.priority-select[data-cat="${cat}"]`);
    addGoal(cat, input.value, sel.value);
    input.value = '';
    input.focus();
  });

  // Enter 鍵新增
  document.querySelector('.main-grid').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const input = e.target.closest('.goal-name-input');
    if (!input) return;
    const cat = input.dataset.cat;
    const sel = document.querySelector(`.priority-select[data-cat="${cat}"]`);
    addGoal(cat, input.value, sel.value);
    input.value = '';
  });

  // Checkbox 勾選
  document.querySelector('.main-grid').addEventListener('change', e => {
    const cb = e.target.closest('.goal-checkbox');
    if (!cb) return;
    const id = cb.id.replace('cb-', '');
    const completed = cb.checked;
    updateGoal(id, { completed, progress: completed ? 100 : undefined });
    if (completed) showToast('🎉 完成一個目標！太棒了！', 'success');
  });

  // Progress slider
  let sliderTimer = null;
  document.querySelector('.main-grid').addEventListener('input', e => {
    const slider = e.target.closest('.progress-slider');
    if (!slider) return;
    const id = slider.dataset.id;
    const val = Number(slider.value);

    // 即時更新 UI
    const fill = document.getElementById(`fill-${id}`);
    const num = document.getElementById(`num-${id}`);
    const hint = document.getElementById(`hint-${id}`);
    if (fill) fill.style.width = val + '%';
    if (num) {
      num.textContent = val + '%';
      num.className = 'progress-num ' + (val >= 100 ? 'full' : val >= 60 ? 'high' : '');
    }
    if (hint) hint.classList.toggle('visible', val >= 100);

    // debounce 儲存
    clearTimeout(sliderTimer);
    sliderTimer = setTimeout(() => {
      updateGoal(id, { progress: val });
    }, 600);
  });

  // 刪除按鈕
  document.querySelector('.main-grid').addEventListener('click', e => {
    const btn = e.target.closest('.btn-delete-goal');
    if (!btn) return;
    deleteGoal(btn.dataset.id);
  });

  // 設定彈窗
  document.getElementById('btnConfig').addEventListener('click', () => {
    document.getElementById('webAppUrl').value = getWebAppUrl();
    document.getElementById('configModal').classList.add('open');
  });
  document.getElementById('closeConfig').addEventListener('click', closeModal);
  document.getElementById('cancelConfig').addEventListener('click', closeModal);
  document.getElementById('configModal').addEventListener('click', e => {
    if (e.target === document.getElementById('configModal')) closeModal();
  });

  document.getElementById('saveConfig').addEventListener('click', async () => {
    const url = document.getElementById('webAppUrl').value.trim();
    if (!url) { showToast('請輸入 Web App URL', 'error'); return; }
    if (!url.startsWith('https://script.google.com')) {
      showToast('URL 格式不對，請確認是 Apps Script 的 URL', 'error');
      return;
    }
    setSyncStatus('syncing');
    try {
      await API.testConnection(url);
      saveWebAppUrl(url);
      closeModal();
      setSyncStatus('connected');
      showToast('連線成功！正在載入資料 🌸', 'success');
      await loadGoals();
    } catch (e) {
      setSyncStatus('error');
      showToast('連線失敗，請確認 URL 是否正確', 'error');
    }
  });
}

function closeModal() {
  document.getElementById('configModal').classList.remove('open');
}

// ---- 啟動 ----
document.addEventListener('DOMContentLoaded', init);
