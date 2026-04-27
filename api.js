// ===========================
// api.js - Google Sheets 串接
// ===========================

const API = {
  // GET: 讀取所有資料
  async fetchAll() {
    const url = getWebAppUrl();
    if (!url) return null;
    const resp = await fetch(`${url}?action=getAll`, { method: 'GET' });
    if (!resp.ok) throw new Error('GET 失敗');
    const data = await resp.json();
    return data.goals || [];
  },

  // POST: 新增目標
  async addGoal(goal) {
    const url = getWebAppUrl();
    if (!url) return null;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'add', goal }),
    });
    if (!resp.ok) throw new Error('POST 失敗');
    return await resp.json();
  },

  // PUT: 更新目標（進度 / 完成狀態）
  async updateGoal(goal) {
    const url = getWebAppUrl();
    if (!url) return null;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'update', goal }),
    });
    if (!resp.ok) throw new Error('UPDATE 失敗');
    return await resp.json();
  },

  // DELETE: 刪除目標
  async deleteGoal(id) {
    const url = getWebAppUrl();
    if (!url) return null;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    if (!resp.ok) throw new Error('DELETE 失敗');
    return await resp.json();
  },

  // 測試連線
  async testConnection(testUrl) {
    const resp = await fetch(`${testUrl}?action=ping`, { method: 'GET' });
    if (!resp.ok) throw new Error('連線失敗');
    return await resp.json();
  },
};
