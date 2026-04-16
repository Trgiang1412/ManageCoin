import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Menu, MenuItem, ListItemIcon, Snackbar, Alert } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

// Import config
import { API_BASE_URL } from '../../config';

// Import utility and basic config
export const categoryConfig = {
    'Thu nhập': { icon: '💰', color: '#FFF3CD', name: 'THU NHẬP' },
    'Ăn uống': { icon: '🍗', color: '#F8D7DA', name: 'ĂN UỐNG' },
    'Di chuyển': { icon: '🚗', color: '#D1ECF1', name: 'DI CHUYỂN' },
    'Mua sắm': { icon: '🛍️', color: '#E2D9F3', name: 'MUA SẮM' },
    'Tiết kiệm': { icon: '🐷', color: '#D4EDDA', name: 'TIẾT KIỆM' },
    'Khác': { icon: '📦', color: '#E2E3E5', name: 'KHÁC' }
};

export const formatCurrencyShort = (value) => {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace('.0', '') + ' tỷ';
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'tr';
    if (value >= 1000) return (value / 1000).toFixed(1).replace('.0', '') + 'k';
    return value + 'đ';
};

// Import Components
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import SuccessPopup from './components/SuccessPopup';
import TransactionInput from './components/TransactionInput';
import UnassignedItems from './components/UnassignedItems';
import CategoryGrid from './components/CategoryGrid';
import LeftMenuDrawer from './components/LeftMenuDrawer';

// Import Dialogs
import CategoryDetailsDialog from './dialogs/CategoryDetailsDialog';
import FinishMonthDialog from './dialogs/FinishMonthDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';
import AssignCategoryDialog from './dialogs/AssignCategoryDialog';
import CreateFamilyDialog from './dialogs/CreateFamilyDialog';
import FamilyMembersDialog from './dialogs/FamilyMembersDialog';
import InviteDialog from './dialogs/InviteDialog';

export default function Dashboard() {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);

    // Popup state
    const [lastTransaction, setLastTransaction] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [recentAddedIds, setRecentAddedIds] = useState([]);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [itemToCategorize, setItemToCategorize] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState(null);
    const [categoryInput, setCategoryInput] = useState('');

    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const openSettings = Boolean(settingsAnchorEl);

    const [openFinishMonthDialog, setOpenFinishMonthDialog] = useState(false);
    const [snackbarObj, setSnackbarObj] = useState({ open: false, message: '', severity: 'success' });
    const [dbCategories, setDbCategories] = useState([]);

    // Family states
    const [familyData, setFamilyData] = useState(null);
    const [openCreateFamily, setOpenCreateFamily] = useState(false);
    const [openFamilyMembers, setOpenFamilyMembers] = useState(false);
    const [inviteData, setInviteData] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const messagesEndRef = useRef(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const [recognition, setRecognition] = useState(null);

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

            rec.onend = () => {
                setIsListening(false);
            };
            setRecognition(rec);
        }
        fetchData();
        fetchFamily();
        checkInvite();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkInvite = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.sendfamily && res.data.sendfamily._id) {
                setInviteData(res.data.sendfamily);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFamily = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/family`, { headers: { Authorization: `Bearer ${token}` } });
            setFamilyData(res.data);
        } catch (err) {
            setFamilyData(null);
        }
    };

    const calculateBalance = (lists) => {
        let total = 0;
        lists.forEach(t => {
            const isIncome = t.id_category?.type_category === 'income';
            if (isIncome) total += t.price;
            else total -= t.price;
        });
        setBalance(total);
    };

    const fetchData = async () => {
        try {
            const catRes = await axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } });
            setDbCategories(catRes.data);

            const transRes = await axios.get(`${API_BASE_URL}/lists`, { headers: { Authorization: `Bearer ${token}` } });
            const lists = transRes.data;
            setTransactions(lists);
            calculateBalance(lists);
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

    const handleVoiceInput = () => {
        if (!recognition) return alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!');
        isListening ? recognition.stop() : (recognition.start(), setIsListening(true));
    };

    const handleSend = (e) => {
        e.preventDefault();
        processTransaction(input);
    };

    const processTransaction = async (text) => {
        if (!text.trim()) return;
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/lists`, { input: text }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchData();
            setInput('');
            
            const transaction = res.data.transaction;
            setLastTransaction(transaction);
            setShowPopup(true);

            if (transaction.category_name) {
                setRecentAddedIds(prev => [...prev, transaction._id]);
                setTimeout(() => setRecentAddedIds(prev => prev.filter(id => id !== transaction._id)), 5000);
            }
            setTimeout(() => setShowPopup(false), 5000);
        } catch (err) {} finally { setLoading(false); }
    };

    const handleAssignCategory = async (item, newCategory) => {
        try {
            setLoading(true);
            await axios.put(`${API_BASE_URL}/lists/${item._id}`, { category_name: newCategory }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchData();
            setLastTransaction({ ...item, category_name: newCategory });
            setShowPopup(true);
            setRecentAddedIds(prev => [...prev, item._id]);
            setTimeout(() => setRecentAddedIds(prev => prev.filter(id => id !== item._id)), 5000);
            setTimeout(() => setShowPopup(false), 5000);
            setItemToCategorize(null);
        } catch (err) {} finally { setLoading(false); }
    };

    const handleDeleteTransaction = (id) => { setItemToDeleteId(id); setDeleteConfirmOpen(true); };

    const confirmDeleteTransaction = async () => {
        if (!itemToDeleteId) return;
        try {
            setLoading(true);
            await axios.delete(`${API_BASE_URL}/lists/${itemToDeleteId}`, { headers: { Authorization: `Bearer ${token}` } });
            await fetchData();
        } catch (err) {} finally { setLoading(false); setDeleteConfirmOpen(false); setItemToDeleteId(null); }
    };

    const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

    const handleFinishMonth = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/lists/end-month`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbarObj({ open: true, message: `Thành công! Đã chốt chi tiêu cho tháng ${res.data.done_month} với ${res.data.count} khoản chi.`, severity: 'success' });
            setOpenFinishMonthDialog(false);
            await fetchData();
        } catch (err) {
            setSnackbarObj({ open: true, message: err.response?.data?.message || 'Có lỗi xảy ra khi chốt tháng', severity: 'error' });
        } finally { setLoading(false); }
    };

    const categoryTotals = {};
    let totalExpense = 0;
    dbCategories.forEach(c => { categoryTotals[c.category_name] = 0; });
    transactions.forEach(t => {
        const catName = t.category_name || 'Khác';
        if (!categoryTotals[catName]) categoryTotals[catName] = 0;
        categoryTotals[catName] += t.price;
        if (t.id_category?.type_category !== 'income' && catName !== 'Tiết kiệm' && catName !== 'Thu nhập') totalExpense += t.price;
    });

    const getTransactionKeyword = (content) => content || '';

    const handleCreateFamily = async (name) => {
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/family`, { name }, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbarObj({ open: true, message: 'Tạo nhóm gia đình thành công!', severity: 'success' });
            setOpenCreateFamily(false);
            await fetchFamily();
        } catch (err) {
            setSnackbarObj({ open: true, message: err.response?.data?.message || 'Có lỗi xảy ra', severity: 'error' });
        } finally { setLoading(false); }
    };

    const handleInviteMember = async (email) => {
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/family/add-member`, { email }, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbarObj({ open: true, message: 'Đã gửi lời mời tham gia nhóm!', severity: 'success' });
            await fetchFamily();
        } catch (err) {
            setSnackbarObj({ open: true, message: err.response?.data?.message || 'Có lỗi xảy ra', severity: 'error' });
        } finally { setLoading(false); }
    };

    const handleAcceptInvite = async () => {
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/family/accept-invite`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbarObj({ open: true, message: 'Tham gia gia đình thành công!', severity: 'success' });
            setInviteData(null);
            fetchFamily();
        } catch (err) {
            setSnackbarObj({ open: true, message: err.response?.data?.message || 'Có lỗi xảy ra', severity: 'error' });
        } finally { setLoading(false); }
    };

    const handleRejectInvite = async () => {
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/family/reject-invite`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbarObj({ open: true, message: 'Đã từ chối lời mời', severity: 'info' });
            setInviteData(null);
        } catch (err) {
            setSnackbarObj({ open: true, message: err.response?.data?.message || 'Có lỗi xảy ra', severity: 'error' });
        } finally { setLoading(false); }
    };

    return (
        <Box sx={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA', position: 'relative', overflow: 'hidden' }}>
            <SuccessPopup showPopup={showPopup} lastTransaction={lastTransaction} categoryConfig={categoryConfig} getTransactionKeyword={getTransactionKeyword} categoryTotals={categoryTotals} totalExpense={totalExpense} />
            <Box sx={{ px: 3, pt: 4, pb: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Header 
                    user={user} 
                    setDrawerOpen={setDrawerOpen} 
                    familyData={familyData} 
                    onOpenCreate={() => setOpenCreateFamily(true)} 
                    onOpenMembers={() => setOpenFamilyMembers(true)} 
                />
                
                <Menu
                    id="settings-menu" anchorEl={settingsAnchorEl} open={openSettings} onClose={() => setSettingsAnchorEl(null)}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))', mt: 1.5,
                            '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                            '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Đăng xuất
                    </MenuItem>
                </Menu>

                <BalanceCard balance={balance} setOpenFinishMonthDialog={setOpenFinishMonthDialog} />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 12, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mt: 'auto', width: '100%' }}>
                    <UnassignedItems transactions={transactions} setItemToCategorize={setItemToCategorize} handleDeleteTransaction={handleDeleteTransaction} getTransactionKeyword={getTransactionKeyword} />
                    <CategoryGrid dbCategories={dbCategories} transactions={transactions} recentAddedIds={recentAddedIds} categoryConfig={categoryConfig} categoryTotals={categoryTotals} setSelectedCategoryName={setSelectedCategoryName} getTransactionKeyword={getTransactionKeyword} formatCurrencyShort={formatCurrencyShort} />
                </Box>
                <div ref={messagesEndRef} />
            </Box>

            <TransactionInput handleSend={handleSend} handleVoiceInput={handleVoiceInput} input={input} setInput={setInput} isListening={isListening} loading={loading} />
            
            <CategoryDetailsDialog selectedCategoryName={selectedCategoryName} setSelectedCategoryName={setSelectedCategoryName} categoryConfig={categoryConfig} transactions={transactions} categoryInput={categoryInput} setCategoryInput={setCategoryInput} processTransaction={processTransaction} loading={loading} getTransactionKeyword={getTransactionKeyword} handleDeleteTransaction={handleDeleteTransaction} />
            <FinishMonthDialog openFinishMonthDialog={openFinishMonthDialog} setOpenFinishMonthDialog={setOpenFinishMonthDialog} handleFinishMonth={handleFinishMonth} loading={loading} />
            <DeleteConfirmDialog deleteConfirmOpen={deleteConfirmOpen} setDeleteConfirmOpen={setDeleteConfirmOpen} confirmDeleteTransaction={confirmDeleteTransaction} loading={loading} />
            <AssignCategoryDialog itemToCategorize={itemToCategorize} setItemToCategorize={setItemToCategorize} getTransactionKeyword={getTransactionKeyword} dbCategories={dbCategories} categoryConfig={categoryConfig} handleAssignCategory={handleAssignCategory} />
            
            <CreateFamilyDialog open={openCreateFamily} onClose={() => setOpenCreateFamily(false)} onCreate={handleCreateFamily} loading={loading} />
            <FamilyMembersDialog open={openFamilyMembers} onClose={() => setOpenFamilyMembers(false)} familyData={familyData} onInvite={handleInviteMember} loading={loading} />
            <InviteDialog inviteData={inviteData} onAccept={handleAcceptInvite} onReject={handleRejectInvite} loading={loading} />

            <Snackbar open={snackbarObj.open} autoHideDuration={4000} onClose={() => setSnackbarObj({ ...snackbarObj, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbarObj({ ...snackbarObj, open: false })} severity={snackbarObj.severity} sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }} variant="filled">{snackbarObj.message}</Alert>
            </Snackbar>

            <LeftMenuDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} user={user} setSettingsAnchorEl={setSettingsAnchorEl} handleLogout={handleLogout} />
        </Box>
    );
}
