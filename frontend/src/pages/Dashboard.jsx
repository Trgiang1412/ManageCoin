import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Avatar, IconButton, Paper,
    InputBase, CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isListening, setIsListening] = useState(false);

    // Popup state
    const [lastTransaction, setLastTransaction] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

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
            const catRes = await axios.get('http://localhost:5000/api/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDbCategories(catRes.data);

            const transRes = await axios.get('http://localhost:5000/api/lists', {
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
            const res = await axios.post('http://localhost:5000/api/lists', { input: text }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchData();
            setInput('');

            const transaction = res.data.transaction;
            setLastTransaction(transaction);
            setShowPopup(true);

            // Auto hide popup after 4 seconds
            setTimeout(() => {
                setShowPopup(false);
            }, 4000);

        } catch (err) {
            console.error(err);
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
        const parts = content.split(' ');
        if (parts.length > 1) {
            return parts.slice(0, -1).join(' ').toLowerCase();
        }
        return content;
    };

    return (
        <Box sx={{ maxWidth: 480, margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA', position: 'relative', overflow: 'hidden' }}>

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
                                Đã cất vào {lastTransaction.category_name}: {getTransactionKeyword(lastTransaction.content)}
                            </Typography>

                            <Box sx={{ mt: 2, borderTop: '1px dashed #555', pt: 2 }}>
                                <Typography variant="caption" sx={{ color: '#888', display: 'block', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                                    --- Dashboard Tài Lộc ---
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
                    <IconButton size="small" sx={{ bgcolor: '#FFF', boxShadow: 1, mb: 1.5, '&:hover': { bgcolor: '#F0F0F0' } }}>
                        <SettingsIcon fontSize="small" sx={{ color: '#FF9800' }} />
                    </IconButton>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '35px', bgcolor: '#FFF', minWidth: 160, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>SỐ DƯ CÒN LẠI</Typography>
                        <Typography variant="h5" fontWeight="900" sx={{ mt: 0.5, color: '#333' }}>
                            {balance.toLocaleString('vi-VN')}đ
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 12 }}>

                {/* Unassigned / Dragable Area */}
                {(() => {
                    const unassignedItems = transactions.filter(t => t.category_name === 'Khác');
                    if (unassignedItems.length === 0) return null;
                    return (
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 4, mt: 2 }}>
                            {unassignedItems.map(item => (
                                <motion.div key={item._id} drag dragConstraints={{ left: -100, right: 100, top: -50, bottom: 200 }} style={{ zIndex: 50 }}>
                                    <Paper sx={{ p: 1.5, borderRadius: 5, bgcolor: '#fff', textAlign: 'center', boxShadow: 3, minWidth: 100, cursor: 'grab' }}>
                                        <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>CHƯA BIẾT BỎ ĐÂU...</Typography>
                                        <Typography variant="body2" fontWeight="bold">{getTransactionKeyword(item.content)}</Typography>
                                        <Typography variant="body2" color="error">{item.price.toLocaleString('vi-VN')}đ</Typography>
                                    </Paper>
                                </motion.div>
                            ))}
                        </Box>
                    );
                })()}

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, pt: 2 }}>
                    {dbCategories.map((dbCat) => {
                        const key = dbCat.category_name;
                        const config = categoryConfig[key] || { icon: '📦', color: '#E2E3E5', name: key.toUpperCase() };
                        if (key === 'Khác') return null; // Unassigned is handled above

                        // Find recent items for this category to display as drag bubbles
                        const catItems = transactions.filter(t => t.category_name === key).slice(-2);

                        return (
                            <Box key={dbCat._id || key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                {/* Render draggable transaction items assigned to this category */}
                                <Box sx={{ position: 'absolute', top: -30, width: '100%', height: 40 }}>
                                    {catItems.map((item, idx) => (
                                        <motion.div
                                            key={item._id || idx}
                                            drag
                                            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                                            whileDrag={{ scale: 1.1, zIndex: 50 }}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            style={{ position: 'absolute', top: idx * -10, left: '10%', right: '10%', zIndex: 10 + idx }}
                                        >
                                            <Paper sx={{ p: '2px 6px', borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'grab' }}>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                                                    {getTransactionKeyword(item.content)}
                                                </Typography>
                                            </Paper>
                                        </motion.div>
                                    ))}
                                </Box>

                                <Paper elevation={0} sx={{ width: 70, height: 90, borderRadius: '40px 40px 16px 16px', bgcolor: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: '0 4px 10px rgba(0,0,0,0.03)', zIndex: 1 }}>
                                    <Typography fontSize={36}>{config.icon}</Typography>
                                </Paper>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">{config.name}</Typography>
                                <Typography variant="caption" fontWeight="bold" sx={{ mt: 0.5 }}>
                                    {((categoryTotals[key] || 0) / 1000).toFixed(1).replace('.0', '') + (categoryTotals[key] >= 1000 ? 'k' : 'đ')}
                                </Typography>
                            </Box>
                        );
                    })}
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
        </Box>
    );
}
