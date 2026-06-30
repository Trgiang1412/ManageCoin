import { Dialog, DialogTitle, Box, Typography, IconButton, DialogContent, Paper, InputBase, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PetsIcon from '@mui/icons-material/Pets';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function CategoryDetailsDialog({ selectedCategoryName, setSelectedCategoryName, categoryConfig, transactions, categoryInput, setCategoryInput, processTransaction, loading, getTransactionKeyword, handleDeleteTransaction }) {
    if (!selectedCategoryName) return null;

    const config = categoryConfig[selectedCategoryName] || { icon: '📦', color: '#E2E3E5', name: selectedCategoryName.toUpperCase() };
    const catTransactions = transactions.filter(t => t.category_name === selectedCategoryName);

    return (
        <Dialog fullWidth maxWidth="xs" open={!!selectedCategoryName} onClose={() => setSelectedCategoryName(null)}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: config.color, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize={24}>{config.icon}</Typography>
                    <Typography variant="h6" fontWeight="bold">{config.name}</Typography>
                </Box>
                <IconButton onClick={() => setSelectedCategoryName(null)} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', height: '60vh' }}>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Box sx={{ pt: 2, pb: 2, px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {catTransactions.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>Chưa có khoản nào.</Typography>
                        ) : (
                            [...catTransactions].reverse().map(t => (
                                <Box key={t._id} sx={{
                                    display: 'flex', flexDirection: 'column',
                                    py: 1.2, px: 1.5, borderRadius: 3,
                                    bgcolor: 'white',
                                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                                    transition: 'box-shadow 0.15s',
                                    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography fontWeight={700} fontSize={14} sx={{ wordBreak: 'break-word' }}>{getTransactionKeyword(t.content) || 'Khoản chi'}</Typography>
                                        </Box>

                                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                            <Typography fontWeight={900} fontSize={15} sx={{ color: t.id_category?.type_category === 'income' ? '#4caf50' : '#e57373' }}>
                                                {(t.price || 0).toLocaleString('vi-VN')}đ
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            <IconButton size="small" onClick={() => handleDeleteTransaction(t._id)} sx={{ color: '#ef4444', '&:hover': { color: '#dc2626' }, mr: -0.5 }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    {t.user_id?.name && (
                                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                👤 {t.user_id.name}
                                                {t.date && ` - ${new Date(t.date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
                <Box sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: '#fff', position: 'sticky', bottom: 0, zIndex: 10 }}>
                    <Paper component="form" onSubmit={async (e) => {
                        e.preventDefault();
                        if (!categoryInput.trim()) return;
                        await processTransaction(categoryInput, selectedCategoryName);
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
                            {loading ? <CircularProgress size={24} /> : <PetsIcon />}
                        </IconButton>
                    </Paper>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
