import { Dialog, DialogTitle, DialogContent, Typography, Box, Paper, DialogActions, Button } from '@mui/material';

export default function AssignCategoryDialog({ itemToCategorize, setItemToCategorize, getTransactionKeyword, dbCategories, categoryConfig, handleAssignCategory }) {
    return (
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
    );
}
