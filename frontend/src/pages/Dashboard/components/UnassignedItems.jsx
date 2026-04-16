import { Box, Paper, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

export default function UnassignedItems({ transactions, setItemToCategorize, handleDeleteTransaction, getTransactionKeyword }) {
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
}
