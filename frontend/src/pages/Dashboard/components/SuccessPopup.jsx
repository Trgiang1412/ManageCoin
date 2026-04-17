import { Typography, Box, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuccessPopup({ showPopup, lastTransaction, categoryConfig, getTransactionKeyword, categoryTotals, totalExpense }) {
    return (
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
                                    💰 Hạn mức: {(categoryTotals['Hạn mức tháng'] || 0).toLocaleString('vi-VN')}đ
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
    );
}
