// ===========================
// config.js - 設定與常數
// ===========================

const CONFIG = {
  CATEGORIES: ['工作', '成長', '家庭', '健康'],
  CATEGORY_EMOJI: { '工作': '💼', '成長': '🌱', '家庭': '🏠', '健康': '🏃' },
  PRIORITIES: ['高', '中', '低'],
  STALE_DAYS: 7, // 幾天沒更新顯示提醒
  STORAGE_KEY: 'v2026_goals',
  WEB_APP_URL_KEY: 'v2026_webAppUrl',
  TODAY_PICK_KEY: 'v2026_today_pick',
  TODAY_PICK_DATE_KEY: 'v2026_today_date',
};

// 取得/儲存 Web App URL
function getWebAppUrl() {
  return localStorage.getItem(CONFIG.WEB_APP_URL_KEY) || '';
}
function saveWebAppUrl(url) {
  localStorage.setItem(CONFIG.WEB_APP_URL_KEY, url.trim());
}

// 本地資料儲存（備用，當 Sheets 未連線時）
function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
  } catch { return []; }
}
function saveLocal(goals) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(goals));
}

// 產生唯一 id
function genId() {
  return 'goal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff < 7) return `${diff}天前`;
  return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
}

// 檢查是否超過 STALE_DAYS
function isStale(goal) {
  if (goal.completed) return false;
  const updated = goal.updated_at || goal.created_at;
  if (!updated) return false;
  const diff = (Date.now() - new Date(updated)) / (1000 * 60 * 60 * 24);
  return diff >= CONFIG.STALE_DAYS;
}
