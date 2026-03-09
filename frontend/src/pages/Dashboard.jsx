import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Avatar, IconButton, Paper,
    InputBase, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, List as MuiList, ListItem, ListItemText, ListItemSecondaryAction,
    Menu, MenuItem, ListItemIcon, Snackbar, Alert
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const categoryConfig = {
    'Thu nhập': { icon: '💰', color: '#FFF3CD', name: 'THU NHẬP' },
    'Ăn uống': { icon: '🍗', color: '#F8D7DA', name: 'ĂN UỐNG' },
    'Di chuyển': { icon: '🚗', color: '#D1ECF1', name: 'DI CHUYỂN' },
    'Mua sắm': { icon: '🛍️', color: '#E2D9F3', name: 'MUA SẮM' },
    'Tiết kiệm': { icon: '🐷', color: '#D4EDDA', name: 'TIẾT KIỆM' },
    'Khác': { icon: '📦', color: '#E2E3E5', name: 'KHÁC' }
};

const formatCurrencyShort = (value) => {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1).replace('.0', '') + ' tỷ';
    }
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace('.0', '') + 'tr';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return value + 'đ';
};

export default function Dashboard() {
    const navigate = useNavigate();
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

    // Snackbar state
    const [snackbarObj, setSnackbarObj] = useState({ open: false, message: '', severity: 'success' });

    const [dbCategories, setDbCategories] = useState([]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            const catRes = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDbCategories(catRes.data);

            const transRes = await axios.get(`${API_BASE_URL}/lists`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        if (!recognition) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!');
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        processTransaction(input);
    };

    const processTransaction = async (text) => {
        if (!text.trim()) return;

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/lists`, { input: text }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchData();
            setInput('');

            const transaction = res.data.transaction;
            setLastTransaction(transaction);
            setShowPopup(true);

            if (transaction.category_name && transaction.category_name !== '') {
                setRecentAddedIds(prev => [...prev, transaction._id]);
                setTimeout(() => {
                    setRecentAddedIds(prev => prev.filter(id => id !== transaction._id));
                }, 5000);
            }

            // Auto hide popup after 5 seconds
            setTimeout(() => {
                setShowPopup(false);
            }, 5000);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignCategory = async (item, newCategory) => {
        try {
            setLoading(true);
            await axios.put(`${API_BASE_URL}/lists/${item._id}`, { category_name: newCategory }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();

            setLastTransaction({ ...item, category_name: newCategory });
            setShowPopup(true);

            setRecentAddedIds(prev => [...prev, item._id]);
            setTimeout(() => {
                setRecentAddedIds(prev => prev.filter(id => id !== item._id));
            }, 5000);

            setTimeout(() => setShowPopup(false), 5000);
            setItemToCategorize(null);
        } catch (err) {
            console.error('Update failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = (id) => {
        setItemToDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteTransaction = async () => {
        if (!itemToDeleteId) return;
        try {
            setLoading(true);
            await axios.delete(`${API_BASE_URL}/lists/${itemToDeleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setItemToDeleteId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleFinishMonth = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/lists/end-month`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbarObj({
                open: true,
                message: `Thành công! Đã chốt chi tiêu cho tháng ${res.data.done_month} với ${res.data.count} khoản chi.`,
                severity: 'success'
            });
            setOpenFinishMonthDialog(false);
            await fetchData();
        } catch (err) {
            console.error('Lỗi khi chốt tháng', err);
            setSnackbarObj({
                open: true,
                message: err.response?.data?.message || 'Có lỗi xảy ra khi chốt tháng',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const categoryTotals = {};
    let totalExpense = 0;

    // Initialize DB categories with 0
    dbCategories.forEach(c => {
        categoryTotals[c.category_name] = 0;
    });

    transactions.forEach(t => {
        const catName = t.category_name || 'Khác';

        if (!categoryTotals[catName]) categoryTotals[catName] = 0;
        categoryTotals[catName] += t.price;

        if (t.id_category?.type_category !== 'income' && catName !== 'Tiết kiệm' && catName !== 'Thu nhập') {
            totalExpense += t.price;
        }
    });

    const getTransactionKeyword = (content) => {
        if (!content) return '';
        // "bún bò 30k" -> "bún bò"
        // const parts = content.split(' ');
        // if (parts.length > 1) {
        //     return parts.slice(0, -1).join(' ').toLowerCase();
        // }
        return content;
    };

    return (
        <Box sx={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA', position: 'relative', overflow: 'hidden' }}>

            {/* Custom Fancy Popup */}
            <AnimatePresence>
                {showPopup && lastTransaction && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 100 }}
                    >
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: '#2C2F33', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid #444' }}>
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <span style={{ fontSize: '24px', marginRight: '8px' }}>
                                    {categoryConfig[lastTransaction.category_name]?.icon || '📦'}
                                </span>
                                <span style={{ color: '#4caf50', margin: '0 8px', fontSize: '20px' }}>✅</span>
                                {lastTransaction.category_name ? `Đã cất vào ${lastTransaction.category_name}: ` : 'Đã lưu khoản chi: '}
                                {getTransactionKeyword(lastTransaction.content)}
                            </Typography>

                            <Box sx={{ mt: 2, borderTop: '1px dashed #555', pt: 2 }}>
                                <Typography variant="caption" sx={{ color: '#888', display: 'block', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                                    --- ManageCoin ---
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#81c784', fontWeight: 'bold' }}>
                                        💰 Thu: {(categoryTotals['Thu nhập'] || 0).toLocaleString('vi-VN')}đ
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#e57373', fontWeight: 'bold' }}>
                                        💸 Chi: {totalExpense.toLocaleString('vi-VN')}đ
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#ffd54f', fontWeight: 'bold' }}>
                                        🏦 Tiết kiệm: {(categoryTotals['Tiết kiệm'] || 0).toLocaleString('vi-VN')}đ
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            <Box sx={{ p: 3, pt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                    <Avatar sx={{ width: 68, height: 68, bgcolor: '#C8E6C9', mb: 1, boxShadow: 2 }} src={user.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} />
                    <Paper elevation={0} sx={{ py: 0.5, px: 2, borderRadius: 8, bgcolor: '#FFF', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <Typography variant="caption" fontWeight="bold">Hello, {user.name || 'User'}!</Typography>
                    </Paper>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => setOpenFinishMonthDialog(true)}
                            sx={{ bgcolor: '#FFF', boxShadow: 1, mb: 1.5, '&:hover': { bgcolor: '#F0F0F0' }, color: '#4CAF50' }}
                        >
                            <RestartAltIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
                            aria-controls={openSettings ? 'settings-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={openSettings ? 'true' : undefined}
                            sx={{ bgcolor: '#FFF', boxShadow: 1, mb: 1.5, '&:hover': { bgcolor: '#F0F0F0' } }}
                        >
                            <SettingsIcon fontSize="small" sx={{ color: '#FF9800' }} />
                        </IconButton>
                    </Box>
                    <Menu
                        id="settings-menu"
                        anchorEl={settingsAnchorEl}
                        open={openSettings}
                        onClose={() => setSettingsAnchorEl(null)}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&::before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            Đăng xuất
                        </MenuItem>
                    </Menu>

                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '35px', bgcolor: '#FFF', minWidth: 160, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>SỐ DƯ CÒN LẠI</Typography>
                        <Typography variant="h5" fontWeight="900" sx={{ mt: 0.5, color: '#333' }}>
                            {balance.toLocaleString('vi-VN')}đ
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 12, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mt: 'auto', width: '100%' }}>
                    {/* Unassigned / Dragable Area */}
                    {(() => {
                        const unassignedItems = transactions.filter(t => !t.category_name || t.category_name === '');
                        if (unassignedItems.length === 0) return null;

                        // Limit to 2 unassigned items shown at a time
                        const visibleUnassignedItems = unassignedItems.slice(0, 2);

                        return (
                            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 1, mt: 0 }}>
                                {visibleUnassignedItems.map(item => (
                                    <motion.div
                                        key={item._id}
                                        drag
                                        dragSnapToOrigin={true}
                                        whileDrag={{ scale: 1.1, zIndex: 100 }}
                                        style={{ zIndex: 50, cursor: 'grab', position: 'relative', marginTop: '12px', marginRight: '12px' }}
                                    >
                                        <Paper onClick={() => setItemToCategorize(item)} sx={{ px: 1.5, py: 0.8, borderRadius: 5, bgcolor: '#fff', textAlign: 'center', boxShadow: 3, border: '1px dashed #ff9800', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '80px' }}>
                                            <Typography variant="caption" sx={{ color: '#ff9800', display: 'block', mb: 0.1, fontWeight: 'bold', fontSize: '0.6rem' }}>CHƯA PHÂN LOẠI</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>{getTransactionKeyword(item.content)}</Typography>
                                        </Paper>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTransaction(item._id);
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                bgcolor: 'white',
                                                boxShadow: 2,
                                                padding: '2px',
                                                border: '1px solid #eee',
                                                '&:hover': { bgcolor: '#ffebee' },
                                                zIndex: 10
                                            }}
                                        >
                                            <CloseIcon sx={{ fontSize: 12, color: 'error.main' }} />
                                        </IconButton>
                                    </motion.div>
                                ))}
                            </Box>
                        );
                    })()}

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, pt: 4 }}>
                        {dbCategories.map((dbCat) => {
                            const key = dbCat.category_name;
                            const config = categoryConfig[key] || { icon: '📦', color: '#E2E3E5', name: key.toUpperCase() };
                            // Unassigned is handled above

                            // Find recent items for this category to display as drag bubbles
                            const catItems = transactions.filter(t => t.category_name === key && recentAddedIds.includes(t._id)).slice(-2);

                            return (
                                <Box key={dbCat._id || key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                    {/* Render click-to-categorize transaction items assigned to this category */}
                                    <Box sx={{ position: 'absolute', top: -30, width: '100%', height: 40 }}>
                                        {catItems.map((item, idx) => (
                                            <motion.div
                                                key={item._id || idx}
                                                // onClick={() => setItemToCategorize(item)}
                                                drag
                                                dragSnapToOrigin={true}
                                                dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                                                whileDrag={{ scale: 1.1, zIndex: 100 }}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                style={{ position: 'absolute', top: idx * -10, left: '10%', right: '10%', zIndex: 10 + idx, cursor: 'grab' }}
                                            >
                                                <Paper sx={{ p: '2px 6px', borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                                                        {getTransactionKeyword(item.content)}
                                                    </Typography>
                                                </Paper>
                                            </motion.div>
                                        ))}
                                    </Box>

                                    <Paper elevation={0} data-category={dbCat.category_name} onClick={() => setSelectedCategoryName(dbCat.category_name)} sx={{ cursor: 'pointer', width: 60, height: 75, borderRadius: '30px 30px 12px 12px', bgcolor: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: '0 4px 10px rgba(0,0,0,0.03)', zIndex: 1, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                                        <Typography fontSize={28}>{config.icon}</Typography>
                                    </Paper>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">{config.name}</Typography>
                                    <Typography variant="caption" fontWeight="bold" sx={{ mt: 0.5 }}>
                                        {formatCurrencyShort(categoryTotals[key] || 0)}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
                <div ref={messagesEndRef} />
            </Box>

            <Paper component="form" onSubmit={handleSend} elevation={10} sx={{ position: 'absolute', bottom: 20, left: 20, right: 20, p: '4px 8px', display: 'flex', alignItems: 'center', borderRadius: 8, bgcolor: '#FFF', zIndex: 10 }}>
                <IconButton color={isListening ? "error" : "primary"} onClick={handleVoiceInput} sx={{ p: '10px' }}>
                    <MicIcon />
                </IconButton>
                <InputBase sx={{ ml: 1, flex: 1, py: 1 }} placeholder="Nhập (vd: Bún bò 30k)" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
                <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={loading || !input.trim()}>
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
            </Paper>

            {/* Category Details Dialog */}
            <Dialog fullWidth maxWidth="xs" open={!!selectedCategoryName} onClose={() => setSelectedCategoryName(null)}>
                {selectedCategoryName && (() => {
                    const config = categoryConfig[selectedCategoryName] || { icon: '📦', color: '#E2E3E5', name: selectedCategoryName.toUpperCase() };
                    const catTransactions = transactions.filter(t => t.category_name === selectedCategoryName);
                    return (
                        <>
                            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: config.color, pb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontSize={24}>{config.icon}</Typography>
                                    <Typography variant="h6" fontWeight="bold">{config.name}</Typography>
                                </Box>
                                <IconButton onClick={() => setSelectedCategoryName(null)} size="small">
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{ p: 0, bgcolor: '#FAFAFA' }}>
                                <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#fff' }}>
                                    <Paper component="form" onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!categoryInput.trim()) return;
                                        await processTransaction(`${selectedCategoryName} ${categoryInput}`);
                                        setCategoryInput('');
                                    }} elevation={0} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: 2, border: '1px solid #ddd' }}>
                                        <InputBase
                                            sx={{ ml: 1, flex: 1 }}
                                            placeholder={`Thêm khoản vào ${selectedCategoryName}...`}
                                            value={categoryInput}
                                            onChange={(e) => setCategoryInput(e.target.value)}
                                            disabled={loading}
                                        />
                                        <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={loading || !categoryInput.trim()}>
                                            {loading ? <CircularProgress size={24} /> : <SendIcon />}
                                        </IconButton>
                                    </Paper>
                                </Box>
                                <MuiList sx={{ pt: 0, pb: 2 }}>
                                    {catTransactions.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>Chưa có khoản nào.</Typography>
                                    ) : (
                                        [...catTransactions].reverse().map(t => (
                                            <ListItem key={t._id} sx={{ borderBottom: '1px solid #f0f0f0', bgcolor: '#fff' }}>
                                                <ListItemText
                                                    primary={getTransactionKeyword(t.content) || 'Khoản chi'}
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                    secondary={`${new Date(t.date).toLocaleDateString('vi-VN')}${t.user_id?.name ? ` • ${t.user_id.name}` : ''}`}
                                                    secondaryTypographyProps={{ variant: 'caption' }}
                                                />
                                                <Typography variant="body2" fontWeight="bold" sx={{ mr: 2, color: t.id_category?.type_category === 'income' ? '#4caf50' : '#e57373' }}>
                                                    {t.id_category?.type_category === 'income' ? '+' : '-'}{(t.price || 0).toLocaleString('vi-VN')}đ
                                                </Typography>
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTransaction(t._id)} size="small" color="error">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))
                                    )}
                                </MuiList>
                            </DialogContent>
                        </>
                    );
                })()}
            </Dialog>

            {/* Confirm Finish Month Dialog */}
            <Dialog open={openFinishMonthDialog} onClose={() => setOpenFinishMonthDialog(false)}>
                <DialogTitle>Xác nhận chốt tháng</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có muốn kết thúc tháng chi tiêu hiện tại không?
                        Hành động này sẽ đóng băng các khoản chi hiện tại và tính vào lịch sử tháng.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFinishMonthDialog(false)} color="inherit" disabled={loading}>Hủy</Button>
                    <Button onClick={handleFinishMonth} variant="contained" color="error" disabled={loading} autoFocus>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Chốt tháng'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => !loading && setDeleteConfirmOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa khoản này? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={loading}>Hủy</Button>
                    <Button onClick={confirmDeleteTransaction} variant="contained" color="error" disabled={loading} autoFocus>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Xóa'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Categorize Dialog */}
            <Dialog open={!!itemToCategorize} onClose={() => setItemToCategorize(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Chọn danh mục</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                        Phân loại cho hạn mục: <b>{itemToCategorize ? getTransactionKeyword(itemToCategorize.content) : ''}</b>
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, pb: 2 }}>
                        {dbCategories.map((cat) => {
                            const config = categoryConfig[cat.category_name] || { icon: '📦', color: '#E2E3E5', name: cat.category_name.toUpperCase() };
                            return (
                                <Box
                                    key={cat._id}
                                    onClick={() => handleAssignCategory(itemToCategorize, cat.category_name)}
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', p: 1, borderRadius: 3, transition: 'background-color 0.2s', '&:hover': { bgcolor: '#f0f0f0' } }}
                                >
                                    <Paper elevation={0} sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <Typography fontSize={28}>{config.icon}</Typography>
                                    </Paper>
                                    <Typography variant="caption" align="center" fontWeight="bold">{config.name}</Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItemToCategorize(null)} color="inherit" fullWidth>Hủy</Button>
                </DialogActions>
            </Dialog>

            {/* Global Snackbar */}
            <Snackbar
                open={snackbarObj.open}
                autoHideDuration={4000}
                onClose={() => setSnackbarObj({ ...snackbarObj, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarObj({ ...snackbarObj, open: false })}
                    severity={snackbarObj.severity}
                    sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}
                    variant="filled"
                >
                    {snackbarObj.message}
                </Alert>
            </Snackbar>

        </Box>
    );
}
