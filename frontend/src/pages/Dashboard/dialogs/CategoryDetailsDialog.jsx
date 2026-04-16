import { Dialog, DialogTitle, Box, Typography, IconButton, DialogContent, Paper, InputBase, CircularProgress, List as MuiList, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

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
        </Dialog>
    );
}
