import { Dialog, DialogTitle, DialogContent, Typography, Box, Paper, DialogActions, Button } from '@mui/material';

export default function TravelAssignCategoryDialog({ itemToCategorize, setItemToCategorize, getTransactionKeyword, categoriesConfig, handleAssignCategory }) {
    return (
        <Dialog open={!!itemToCategorize} onClose={() => setItemToCategorize(null)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Chọn danh mục</DialogTitle>
            <DialogContent>
                <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                    Phân loại cho hạn mục: <b>{itemToCategorize ? getTransactionKeyword(itemToCategorize.title) : ''}</b>
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, pb: 2 }}>
                    {Object.entries(categoriesConfig)
                        .filter(([_, config]) => !config.hidden)
                        .map(([key, config]) => {
                        return (
                            <Box
                                key={key}
                                onClick={() => handleAssignCategory(itemToCategorize, key)}
                                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', p: 1, borderRadius: 3, transition: 'background-color 0.2s', '&:hover': { bgcolor: '#f0f0f0' } }}
                            >
                                <Paper elevation={0} sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: config.bg, border: `2px solid ${config.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                    <Typography fontSize={28}>{config.icon}</Typography>
                                </Paper>
                                <Typography variant="caption" align="center" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>{config.label}</Typography>
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
