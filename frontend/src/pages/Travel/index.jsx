import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Fab, Skeleton, Snackbar, Alert, Tab, Tabs
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { STATUS_CONFIG } from './travelConfig';
import { TRAVEL_CATEGORIES } from './TravelFundDetail';
import FundCard from './components/FundCard';
import AddFundDialog from './components/AddFundDialog';
import TravelCategoryDetailsDialog from './components/TravelCategoryDetailsDialog';

const STATUS_TABS = ['all', 'planning', 'ongoing', 'completed'];
const STATUS_LABELS = ['Tất cả', 'Sắp tới', 'Đang đi', 'Đã kết thúc'];

export default function TravelPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [tab, setTab] = useState(0);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    // Contribution dialog states
    const [contributionFund, setContributionFund] = useState(null);
    const [contributionExpenses, setContributionExpenses] = useState([]);
    const [contributionLoading, setContributionLoading] = useState(false);

    const headers = { Authorization: `Bearer ${token}` };

    const fetchFunds = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/travel/funds`, { headers });
            setFunds(res.data);
        } catch {
            setSnack({ open: true, msg: 'Không tải được danh sách quỹ', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFunds(); }, [fetchFunds]);

    const handleOpenContribution = async (e, fund) => {
        e.stopPropagation();
        setContributionFund(fund);
        setContributionLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/travel/funds/${fund._id}/expenses`, { headers });
            setContributionExpenses(res.data);
        } catch {
            setSnack({ open: true, msg: 'Lỗi tải dữ liệu', severity: 'error' });
        } finally {
            setContributionLoading(false);
        }
    };

    const processContribution = async (text, category) => {
        if (!text.trim() || !contributionFund) return;
        try {
            setContributionLoading(true);
            await axios.post(`${API_BASE_URL}/travel/funds/${contributionFund._id}/expenses`, { input: text, overrideCategory: category }, { headers });
            const res = await axios.get(`${API_BASE_URL}/travel/funds/${contributionFund._id}/expenses`, { headers });
            setContributionExpenses(res.data);
            fetchFunds(); // Refresh funds to update budget/spent amounts
        } catch {
            setSnack({ open: true, msg: 'Lỗi ghi khoản góp', severity: 'error' });
        } finally {
            setContributionLoading(false);
        }
    };

    const handleDeleteContribution = async (eid) => {
        if (!contributionFund) return;
        try {
            await axios.delete(`${API_BASE_URL}/travel/funds/${contributionFund._id}/expenses/${eid}`, { headers });
            const res = await axios.get(`${API_BASE_URL}/travel/funds/${contributionFund._id}/expenses`, { headers });
            setContributionExpenses(res.data);
            fetchFunds();
        } catch {
            setSnack({ open: true, msg: 'Lỗi xoá', severity: 'error' });
        }
    };

    const handleCreate = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/travel/funds`, data, { headers });
            setSnack({ open: true, msg: '🎉 Tạo quỹ thành công!', severity: 'success' });
            setAddOpen(false);
            fetchFunds();
        } catch {
            setSnack({ open: true, msg: 'Có lỗi xảy ra', severity: 'error' });
        }
    };

    const statusKey = STATUS_TABS[tab];
    const filtered = funds.filter(f => statusKey === 'all' || f.status === statusKey);

    const stats = {
        total: funds.length,
        ongoing: funds.filter(f => f.status === 'ongoing').length,
        totalSpent: funds.reduce((s, f) => s + (f.total_spent || 0), 0),
    };

    return (
        <Box sx={{ maxWidth: 480, mx: 'auto', height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', position: 'relative', overflow: 'hidden' }}>

            {/* ── HEADER ── */}
            <Box sx={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                px: 3, pt: 5, pb: 3,
                position: 'relative', overflow: 'hidden', flexShrink: 0,
            }}>
                {/* Deco blobs */}
                <Box sx={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.15)' }} />
                <Box sx={{ position: 'absolute', left: -30, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(16,185,129,0.1)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, position: 'relative' }}>
                    <IconButton onClick={() => navigate('/')} sx={{ color: 'rgba(255,255,255,0.6)', p: 0.5 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: 2.5,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
                    }}>
                        <FlightTakeoffIcon sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={900} fontSize={20} color="white">Quỹ Du Lịch</Typography>
                        <Typography fontSize={12} color="rgba(255,255,255,0.5)">
                            {stats.total} chuyến · đang đi: {stats.ongoing}
                        </Typography>
                    </Box>
                </Box>

                {/* Quick stats */}
                <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                    {[
                        { label: 'Chuyến đi', value: stats.total, icon: '✈️' },
                        { label: 'Đang đi', value: stats.ongoing, icon: '🌏' },
                        { label: 'Tổng chi', value: stats.totalSpent >= 1_000_000 ? (stats.totalSpent/1_000_000).toFixed(1)+'tr' : stats.totalSpent.toLocaleString('vi-VN')+'đ', icon: '💸' },
                    ].map((s, i) => (
                        <Box key={i} sx={{
                            flex: 1, p: 1.5, borderRadius: 2.5,
                            bgcolor: 'rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center',
                        }}>
                            <Typography fontSize={18}>{s.icon}</Typography>
                            <Typography fontWeight={800} color="white" fontSize={15}>{s.value}</Typography>
                            <Typography fontSize={10} color="rgba(255,255,255,0.5)">{s.label}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── TABS ── */}
            <Tabs
                value={tab} onChange={(_, v) => setTab(v)}
                variant="scrollable" scrollButtons={false}
                sx={{
                    bgcolor: 'white', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3, borderRadius: 99 }
                }}
            >
                {STATUS_LABELS.map((l, i) => (
                    <Tab key={i} label={`${l}${i > 0 ? ` (${funds.filter(f => f.status === STATUS_TABS[i]).length})` : ` (${funds.length})`}`}
                        sx={{ fontWeight: 700, fontSize: 12, minWidth: 80 }}
                    />
                ))}
            </Tabs>

            {/* ── FUND LIST ── */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, pb: 10 }}>
                {loading ? (
                    [1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 3, mb: 2 }} />
                    ))
                ) : filtered.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography fontSize={56}>✈️</Typography>
                        <Typography fontWeight={700} fontSize={18} mt={2} color="text.primary">
                            Chưa có chuyến đi nào
                        </Typography>
                        <Typography color="text.secondary" mt={1} mb={3}>
                            Tạo quỹ đầu tiên để bắt đầu theo dõi chi tiêu du lịch
                        </Typography>
                        <Box
                            onClick={() => setAddOpen(true)}
                            sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 1,
                                px: 3, py: 1.5, borderRadius: 99, cursor: 'pointer',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                color: 'white', fontWeight: 700, fontSize: 14,
                                boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                            }}
                        >
                            <AddIcon sx={{ fontSize: 18 }} /> Tạo chuyến đi
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filtered.map(fund => (
                            <FundCard
                                key={fund._id}
                                fund={fund}
                                onClick={() => navigate(`/travel/${fund._id}`)}
                                onContributeClick={handleOpenContribution}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* FAB */}
            {filtered.length > 0 && (
                <Fab
                    onClick={() => setAddOpen(true)}
                    sx={{
                        position: 'absolute', bottom: 24, right: 24,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(99,102,241,0.45)',
                        '&:hover': { filter: 'brightness(1.1)' },
                    }}
                >
                    <AddIcon />
                </Fab>
            )}

            <AddFundDialog open={addOpen} onClose={() => setAddOpen(false)} onSave={handleCreate} loading={false} />

            <TravelCategoryDetailsDialog 
                open={!!contributionFund} 
                onClose={() => {
                    setContributionFund(null);
                    setContributionExpenses([]);
                }} 
                categoryName="góp_quỹ" 
                config={TRAVEL_CATEGORIES['góp_quỹ']} 
                expenses={contributionExpenses} 
                onDelete={handleDeleteContribution} 
                onEdit={() => {}} 
                processTransaction={processContribution}
                loading={contributionLoading}
            />

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snack.severity} sx={{ borderRadius: 2 }} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
