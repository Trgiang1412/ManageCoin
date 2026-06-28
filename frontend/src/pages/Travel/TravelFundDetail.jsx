import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, IconButton, Skeleton, Snackbar, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FUND_COLORS, formatVND, formatFullVND, formatDate } from './travelConfig';
import AddFundDialog from './components/AddFundDialog';
import TravelCategoryGrid from './components/TravelCategoryGrid';
import TravelCategoryDetailsDialog from './components/TravelCategoryDetailsDialog';
import TravelUnassignedItems from './components/TravelUnassignedItems';
import TravelAssignCategoryDialog from './components/TravelAssignCategoryDialog';
import TravelInviteDialog from './components/TravelInviteDialog';
import TransactionInput from '../Dashboard/components/TransactionInput';
import SuccessPopup from '../Dashboard/components/SuccessPopup';
import { playSound } from '../../utils/audio';

// Travel Categories Mapping
export const TRAVEL_CATEGORIES = {
    'ăn_uống': { icon: '🍗', bg: '#F8D7DA', color: '#e63946', label: 'Ăn uống' },
    'đi_lại': { icon: '🚗', bg: '#D1ECF1', color: '#0077b6', label: 'Đi lại' },
    'lưu_trú': { icon: '🏨', bg: '#E2D9F3', color: '#7209b7', label: 'Lưu trú' },
    'dịch_vụ': { icon: '🎡', bg: '#FFF3CD', color: '#fca311', label: 'Dịch vụ' },
    'mua_sắm': { icon: '🛍️', bg: '#fcd5ce', color: '#e07a5f', label: 'Mua sắm' },
    'khác': { icon: '📦', bg: '#E2E3E5', color: '#6c757d', label: 'Khác' },
    'góp_quỹ': { icon: '💰', bg: '#caffbf', color: '#2a9d8f', label: 'Góp quỹ', hidden: true }
};

export default function TravelFundDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [fund, setFund] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Dialogs
    const [editFundOpen, setEditFundOpen] = useState(false);
    const [deleteFundConfirm, setDeleteFundConfirm] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState(null);
    const [itemToCategorize, setItemToCategorize] = useState(null);

    // Popup state
    const [lastTransaction, setLastTransaction] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [recentAddedIds, setRecentAddedIds] = useState([]);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const messagesEndRef = useRef(null);
    const headers = { Authorization: `Bearer ${token}` };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const [recognition, setRecognition] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [fundRes, expRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/travel/funds/${id}`, { headers }),
                axios.get(`${API_BASE_URL}/travel/funds/${id}/expenses`, { headers })
            ]);
            setFund(fundRes.data);
            setExpenses(expRes.data);
        } catch (err) {
            setSnack({ open: true, msg: 'Không tải được dữ liệu', severity: 'error' });
            if (err.response?.status === 401 || err.response?.status === 404) {
                navigate('/travel');
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate, token]);

    useEffect(() => {
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.lang = 'vi-VN';
            rec.interimResults = false;

            rec.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                processTransaction(transcript);
            };

            rec.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            rec.onend = () => setIsListening(false);
            setRecognition(rec);
        }
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchAll]);

    const handleVoiceInput = () => {
        if (!recognition) return alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!');
        isListening ? recognition.stop() : (recognition.start(), setIsListening(true));
    };

    const handleSend = (e) => {
        e.preventDefault();
        processTransaction(input);
    };

    const processTransaction = async (text, category = null) => {
        if (!text.trim()) return;
        try {
            setLoading(true);
            const payload = { input: text };
            if (category) payload.overrideCategory = category;
            const res = await axios.post(`${API_BASE_URL}/travel/funds/${id}/expenses`, payload, { headers });
            await fetchAll();
            setInput('');
            playSound('success');
            
            const transaction = res.data.transaction;
            // Map travel transaction to Dashboard transaction format for SuccessPopup
            const popupTrans = { ...transaction, category_name: TRAVEL_CATEGORIES[transaction.category]?.label || 'Khác', price: transaction.amount, content: transaction.title };
            setLastTransaction(popupTrans);
            setShowPopup(true);

            setRecentAddedIds(prev => [...prev, transaction._id]);
            setTimeout(() => setRecentAddedIds(prev => prev.filter(tid => tid !== transaction._id)), 5000);
            setTimeout(() => setShowPopup(false), 5000);
        } catch (err) {
            playSound('error');
            setSnack({ open: true, msg: 'Lỗi ghi chi tiêu', severity: 'error' });
        } finally { setLoading(false); }
    };

    const handleAssignCategory = async (item, newCategory) => {
        try {
            setLoading(true);
            await axios.put(`${API_BASE_URL}/travel/funds/${id}/expenses/${item._id}`, { category: newCategory }, { headers });
            await fetchAll();
            setLastTransaction({ ...item, category: newCategory, category_name: TRAVEL_CATEGORIES[newCategory]?.label || 'Khác' });
            playSound('success');
            setShowPopup(true);
            setRecentAddedIds(prev => [...prev, item._id]);
            setTimeout(() => setRecentAddedIds(prev => prev.filter(tid => tid !== item._id)), 5000);
            setTimeout(() => setShowPopup(false), 5000);
            setItemToCategorize(null);
        } catch (err) {
            playSound('error');
            setSnack({ open: true, msg: 'Lỗi phân loại', severity: 'error' });
        } finally { setLoading(false); }
    };

    const handleDeleteExpense = async (eid) => {
        try {
            await axios.delete(`${API_BASE_URL}/travel/funds/${id}/expenses/${eid}`, { headers });
            setSnack({ open: true, msg: 'Đã xóa chi tiêu', severity: 'success' });
            fetchAll();
        } catch {
            setSnack({ open: true, msg: 'Có lỗi xảy ra', severity: 'error' });
        }
    };

    const handleEditFund = async (data) => {
        try {
            await axios.put(`${API_BASE_URL}/travel/funds/${id}`, data, { headers });
            setSnack({ open: true, msg: 'Đã cập nhật quỹ', severity: 'success' });
            setEditFundOpen(false);
            fetchAll();
        } catch {
            setSnack({ open: true, msg: 'Có lỗi xảy ra', severity: 'error' });
        }
    };

    const handleDeleteFund = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/travel/funds/${id}`, { headers });
            navigate('/travel');
        } catch {
            setSnack({ open: true, msg: 'Có lỗi xảy ra', severity: 'error' });
        }
    };

    const handleInviteMember = async (email) => {
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/travel/funds/${id}/invite`, { email }, { headers });
            setSnack({ open: true, msg: 'Đã mời thành viên!', severity: 'success' });
            setInviteOpen(false);
            fetchAll();
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.message || 'Có lỗi xảy ra', severity: 'error' });
        } finally { setLoading(false); }
    };

    const theme = FUND_COLORS.find(c => c.color === fund?.color) || FUND_COLORS[0];
    
    // Compute category totals
    const categoryTotals = {};
    let totalExpense = 0;
    let totalIncome = 0;
    Object.keys(TRAVEL_CATEGORIES).forEach(key => categoryTotals[key] = 0);
    expenses.forEach(e => {
        const cat = e.category || 'khác';
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += e.amount;
        if (cat === 'góp_quỹ') {
            totalIncome += e.amount;
        } else {
            totalExpense += e.amount;
        }
    });

    // The actual budget might be original budget + contributed income
    const actualBudget = (fund?.budget || 0) + totalIncome;
    const pct = actualBudget > 0 ? Math.min(100, Math.round(totalExpense / actualBudget * 100)) : 0;

    const getTransactionKeyword = (title) => {
        if (!title) return '';
        return title;
    };

    // Prepare Category config for SuccessPopup
    const popupCategoryConfig = {};
    Object.entries(TRAVEL_CATEGORIES).forEach(([k, v]) => {
        popupCategoryConfig[v.label] = { icon: v.icon, color: v.bg, name: v.label.toUpperCase() };
    });

    const popupCategoryTotals = {};
    Object.entries(categoryTotals).forEach(([k, v]) => {
        popupCategoryTotals[TRAVEL_CATEGORIES[k]?.label || 'Khác'] = v;
    });

    if (loading && !fund) {
        return (
            <Box sx={{ maxWidth: 480, mx: 'auto', height: '100dvh', bgcolor: '#f8fafc' }}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 0 }} />
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1,2,3,4].map(i => <Skeleton key={i} height={70} sx={{ borderRadius: 2 }} />)}
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA', position: 'relative', overflow: 'hidden' }}>
            <SuccessPopup showPopup={showPopup} lastTransaction={lastTransaction} categoryConfig={popupCategoryConfig} getTransactionKeyword={getTransactionKeyword} categoryTotals={popupCategoryTotals} totalExpense={totalExpense} />
            
            <Box sx={{ px: 3, pt: 6, pb: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* ── HEADER (Match BalanceCard style) ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: -1, zIndex: 10 }}>
                    <IconButton onClick={() => navigate('/travel')} sx={{ bgcolor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={() => setInviteOpen(true)} sx={{ bgcolor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <GroupAddOutlinedIcon />
                        </IconButton>
                        <IconButton onClick={() => setEditFundOpen(true)} sx={{ bgcolor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <EditOutlinedIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Box component="div" sx={{ position: 'relative', overflow: 'visible', py: 3, px: 3, borderRadius: 4, bgcolor: '#FFF', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Cat animation */}
                    <Box sx={{
                        position: 'absolute', top: '-32px', width: '32px', height: '32px',
                        animation: 'runCat 6s linear infinite',
                        '@keyframes runCat': { '0%': { left: '-40px' }, '100%': { left: '100%' } },
                        zIndex: 2, pointerEvents: 'none', mixBlendMode: 'multiply'
                    }}>
                        <img src="/cat.gif" alt="running cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>

                    {/* Content like BalanceCard but with Fund info */}
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, mb: 0, position: 'relative', zIndex: 1, textTransform: 'uppercase' }}>
                        {fund?.name} • CÒN LẠI
                    </Typography>
                    
                    <Typography variant="h4" fontWeight="900" sx={{ color: (actualBudget - totalExpense) < 0 ? 'error.main' : '#10b981', mt: 0.5, letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>
                        {formatFullVND(Math.max(0, actualBudget - totalExpense))}
                    </Typography>
                    
                    {fund?.destination && (
                        <Typography color="text.secondary" fontSize={13} mt={0.5} fontWeight={500}>
                            📍 {fund.destination}
                        </Typography>
                    )}

                    {/* Budget bar & info */}
                    <Box 
                        sx={{ mt: 2.5, width: '100%', cursor: 'pointer', p: 1, mx: -1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' } }}
                        onClick={() => setSelectedCategoryName('góp_quỹ')}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', fontSize: 12, mb: 0.5 }}>
                            <span>Đã chi: <b style={{ color: '#333' }}>{formatFullVND(totalExpense)}</b></span>
                            <span>Quỹ: <b style={{ color: '#333' }}>{formatFullVND(actualBudget)}</b></span>
                        </Box>
                        {actualBudget > 0 && (
                            <Box sx={{ height: 6, borderRadius: 99, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: pct >= 90 ? '#ef4444' : theme.color, borderRadius: 99, transition: 'width 0.5s' }} />
                            </Box>
                        )}
                        {actualBudget > 0 && (
                            <Typography fontSize={11} color="text.secondary" mt={0.5} textAlign="left">
                                {pct}% đã dùng
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 12, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mt: 'auto', width: '100%' }}>
                    <TravelUnassignedItems 
                        expenses={expenses} 
                        setItemToCategorize={setItemToCategorize} 
                        handleDeleteExpense={handleDeleteExpense} 
                        getTransactionKeyword={getTransactionKeyword} 
                        handleAssignCategory={handleAssignCategory} 
                    />
                    <TravelCategoryGrid 
                        categoriesConfig={TRAVEL_CATEGORIES} 
                        transactions={expenses} 
                        recentAddedIds={recentAddedIds} 
                        categoryTotals={categoryTotals} 
                        setSelectedCategoryName={setSelectedCategoryName} 
                        getTransactionKeyword={getTransactionKeyword} 
                    />
                </Box>
                <div ref={messagesEndRef} />
            </Box>

            <TransactionInput handleSend={handleSend} handleVoiceInput={handleVoiceInput} input={input} setInput={setInput} isListening={isListening} loading={loading} />
            
            <TravelCategoryDetailsDialog 
                open={!!selectedCategoryName} 
                onClose={() => setSelectedCategoryName(null)} 
                categoryName={selectedCategoryName} 
                config={TRAVEL_CATEGORIES[selectedCategoryName]} 
                expenses={expenses} 
                onDelete={handleDeleteExpense} 
                onEdit={() => {}} // Could be extended to support edit
                processTransaction={processTransaction}
                loading={loading}
            />

            <TravelAssignCategoryDialog 
                itemToCategorize={itemToCategorize} 
                setItemToCategorize={setItemToCategorize} 
                getTransactionKeyword={getTransactionKeyword} 
                categoriesConfig={TRAVEL_CATEGORIES} 
                handleAssignCategory={handleAssignCategory} 
            />

            <AddFundDialog open={editFundOpen} onClose={() => setEditFundOpen(false)} onSave={handleEditFund} loading={false} editData={fund} />
            
            <TravelInviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInviteMember} loading={loading} fund={fund} />

            <Dialog open={deleteFundConfirm} onClose={() => setDeleteFundConfirm(false)} PaperProps={{ sx: { mx: 2 } }}>
                <DialogTitle fontWeight={800}>🗑 Xóa quỹ du lịch?</DialogTitle>
                <DialogContent>
                    <Typography>Toàn bộ chi tiêu trong quỹ <b>{fund?.name}</b> sẽ bị xóa vĩnh viễn.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteFundConfirm(false)} variant="outlined" sx={{ borderRadius: 2 }}>Hủy</Button>
                    <Button onClick={handleDeleteFund} variant="contained" color="error" sx={{ borderRadius: 2 }}>Xóa</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snack.severity} sx={{ borderRadius: 2 }} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
