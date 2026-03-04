import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Avatar, IconButton, Paper,
    Grid, InputBase, Snackbar, Alert, Container, CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const categoryConfig = {
    'Thu nhập': { icon: '💰', color: '#FFF3CD', name: 'THU NHẬP' },
    'Ăn uống': { icon: '🍗', color: '#F8D7DA', name: 'ĂN UỐNG' },
    'Di chuyển': { icon: '🚗', color: '#D1ECF1', name: 'DI CHUYỂN' },
    'Mua sắm': { icon: '🛍️', color: '#E2D9F3', name: 'MUA SẮM' },
    'Tiết kiệm': { icon: '🐷', color: '#D4EDDA', name: 'TIẾT KIỆM' },
    'Khác': { icon: '📦', color: '#E2E3E5', name: 'KHÁC' }
};

export default function Dashboard() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(userRes.data.balance);

            const transRes = await axios.get('http://localhost:5000/api/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(transRes.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/api/transactions', { input }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBalance(res.data.balance);
            setTransactions([res.data.transaction, ...transactions]);
            setInput('');

            const isIncome = res.data.transaction.type === 'income';
            setSnackbar({
                open: true,
                message: `Đã ${isIncome ? 'cộng' : 'trừ'} ${res.data.transaction.amount.toLocaleString('vi-VN')}đ vào ${res.data.transaction.category}`,
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Có lỗi xảy ra',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Group transactions by category to show totals
    const categoryTotals = {};
    transactions.forEach(t => {
        // Basic category mapping matching the config above
        let cat = 'Khác';
        const tCatLower = t.category.toLowerCase();
        if (tCatLower.includes('thu') || t.type === 'income') cat = 'Thu nhập';
        else if (tCatLower.includes('ăn') || tCatLower.includes('food')) cat = 'Ăn uống';
        else if (tCatLower.includes('di') || tCatLower.includes('xe') || tCatLower.includes('car')) cat = 'Di chuyển';
        else if (tCatLower.includes('mua') || tCatLower.includes('shopping')) cat = 'Mua sắm';
        else if (tCatLower.includes('tiết') || tCatLower.includes('save')) cat = 'Tiết kiệm';

        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += t.amount;
    });

    return (
        <Box sx={{
            maxWidth: 480,
            margin: '0 auto',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FAFAFA',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header Profile & Balance */}
            <Box sx={{ p: 3, pt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                    <Avatar
                        sx={{ width: 68, height: 68, bgcolor: '#C8E6C9', mb: 1, boxShadow: 2 }}
                        src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" // Fallback cat-like avatar
                    />
                    <Paper elevation={0} sx={{ py: 0.5, px: 2, borderRadius: 8, bgcolor: '#FFF', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <Typography variant="caption" fontWeight="bold">MÈO YÊU CHỦ NHÂN! ❤️</Typography>
                    </Paper>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <IconButton size="small" sx={{ bgcolor: '#FFF', boxShadow: 1, mb: 1.5, '&:hover': { bgcolor: '#F0F0F0' } }}>
                        <SettingsIcon fontSize="small" sx={{ color: '#FF9800' }} />
                    </IconButton>
                    <Paper elevation={0} sx={{
                        p: 2.5,
                        borderRadius: '35px 35px 35px 35px',
                        bgcolor: '#FFF',
                        minWidth: 160,
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                    }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>SỐ DƯ CÒN LẠI</Typography>
                        <Typography variant="h5" fontWeight="900" sx={{ mt: 0.5, color: '#333' }}>
                            {balance.toLocaleString('vi-VN')}đ
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            {/* Main Categories Grid - Scrollable area */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 12 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 3,
                    mt: 3
                }}>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                        <Box key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    width: 70,
                                    height: 90,
                                    borderRadius: '40px 40px 16px 16px',
                                    bgcolor: config.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 1.5,
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                }}>
                                <Typography fontSize={36}>{config.icon}</Typography>
                            </Paper>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">{config.name}</Typography>
                            <Typography variant="caption" fontWeight="bold" sx={{ mt: 0.5 }}>
                                {((categoryTotals[key] || 0) / 1000).toFixed(1).replace('.0', '') + (categoryTotals[key] >= 1000 ? 'k' : 'đ')}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                <div ref={messagesEndRef} />
            </Box>

            {/* Bottom Input Area */}
            <Paper
                component="form"
                onSubmit={handleSend}
                elevation={10}
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    p: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 8,
                    bgcolor: '#FFF'
                }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1, py: 1 }}
                    placeholder="Nhập chi tiêu (vd: Cơm 30k)..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={loading || !input.trim()}>
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
            </Paper>

            {/* Notification Popup */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 4, boxShadow: 3 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
