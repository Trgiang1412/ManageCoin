import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Paper, InputBase, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PetsIcon from '@mui/icons-material/Pets';
import ExpenseItem from './ExpenseItem';

export default function TravelCategoryDetailsDialog({ open, onClose, categoryName, config, expenses, onDelete, onEdit, processTransaction, loading }) {
    const [categoryInput, setCategoryInput] = useState('');

    if (!categoryName) return null;

    const catExpenses = expenses.filter(e => e.category === categoryName);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ p: 2, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: config?.bg }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize={24}>{config?.icon}</Typography>
                    <Typography fontWeight="bold" color={config?.color}>{config?.label}</Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', height: '60vh' }}>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Box sx={{ p: 2 }}>
                    {catExpenses.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                            <Typography>Chưa có chi tiêu nào</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {catExpenses.map(e => (
                                <ExpenseItem key={e._id} expense={e} onDelete={onDelete} onEdit={onEdit} />
                            ))}
                        </Box>
                    )}
                </Box>
                </Box>
                <Box sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: '#fff', position: 'sticky', bottom: 0, zIndex: 10 }}>
                    <Paper component="form" onSubmit={async (e) => {
                        e.preventDefault();
                        if (!categoryInput.trim()) return;
                        await processTransaction(categoryInput, categoryName);
                        setCategoryInput('');
                    }} elevation={0} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: 2, border: '1px solid #ddd' }}>
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder={`Thêm khoản vào ${config?.label}...`}
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                            disabled={loading}
                        />
                        <IconButton type="submit" sx={{ p: '10px', color: config?.color || 'primary.main' }} disabled={loading || !categoryInput.trim()}>
                            {loading ? <CircularProgress size={24} /> : <PetsIcon />}
                        </IconButton>
                    </Paper>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
