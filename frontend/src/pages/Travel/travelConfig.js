// Shared category config cho Travel module
export const TRAVEL_CATEGORIES = {
    'ăn_uống':   { label: 'Ăn uống',   icon: '🍜', color: '#f97316', bg: '#fff7ed' },
    'đi_lại':    { label: 'Đi lại',    icon: '🚌', color: '#3b82f6', bg: '#eff6ff' },
    'lưu_trú':   { label: 'Lưu trú',   icon: '🏨', color: '#8b5cf6', bg: '#f5f3ff' },
    'dịch_vụ':   { label: 'Dịch vụ',   icon: '🎟️', color: '#ec4899', bg: '#fdf2f8' },
    'mua_sắm':   { label: 'Mua sắm',   icon: '🛍️', color: '#f59e0b', bg: '#fffbeb' },
    'khác':      { label: 'Khác',      icon: '📦', color: '#6b7280', bg: '#f9fafb' },
    'góp_quỹ':   { label: 'Góp quỹ',   icon: '💰', color: '#2a9d8f', bg: '#caffbf', hidden: true }
};

export const FUND_COLORS = [
    { color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { color: '#f97316', gradient: 'linear-gradient(135deg,#f97316,#fb923c)' },
    { color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)' },
    { color: '#ec4899', gradient: 'linear-gradient(135deg,#ec4899,#f472b6)' },
    { color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)' },
    { color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
    { color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
    { color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)' },
];

export const STATUS_CONFIG = {
    planning:  { label: 'Sắp tới',      color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    ongoing:   { label: 'Đang đi',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    completed: { label: 'Đã kết thúc', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

export function formatVND(n) {
    if (!n) return '0đ';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0','') + ' tỷ';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace('.0','') + 'tr';
    if (n >= 1_000)         return (n / 1_000).toFixed(1).replace('.0','') + 'k';
    return n.toLocaleString('vi-VN') + 'đ';
}

export function formatFullVND(n) {
    return (n || 0).toLocaleString('vi-VN') + 'đ';
}

export function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function groupExpensesByDate(expenses) {
    const groups = {};
    expenses.forEach(e => {
        const day = new Date(e.date).toLocaleDateString('vi-VN', {
            weekday: 'long', day: '2-digit', month: '2-digit'
        });
        if (!groups[day]) groups[day] = [];
        groups[day].push(e);
    });
    return groups;
}
