import { Box, Paper, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

export default function TravelUnassignedItems({ expenses, setItemToCategorize, handleDeleteExpense, getTransactionKeyword, handleAssignCategory }) {
    const [optimisticHidingIds, setOptimisticHidingIds] = useState([]);

    const unassignedItems = expenses.filter(t => 
        (!t.category || t.category === '') && 
        !optimisticHidingIds.includes(t._id)
    );
    if (unassignedItems.length === 0) return null;

    // Limit to 2 unassigned items shown at a time
    const visibleUnassignedItems = unassignedItems.slice(0, 2);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 1, mt: 0 }}>
            <AnimatePresence>
                {visibleUnassignedItems.map(item => (
                    <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                        drag
                        dragSnapToOrigin={true}
                        whileDrag={{ scale: 1.1, zIndex: 100 }}
                        onDragEnd={(event, info) => {
                            const clientX = info.point.x;
                            const clientY = info.point.y;
                            const elements = document.elementsFromPoint(clientX, clientY);
                            // We need to support touch events properly and use the point info
                            const categoryElement = elements.find(el => el.getAttribute('data-category'));
                            if (categoryElement) {
                                const newCategory = categoryElement.getAttribute('data-category');
                                setOptimisticHidingIds(prev => [...prev, item._id]);
                                if (handleAssignCategory) {
                                    handleAssignCategory(item, newCategory);
                                }
                            }
                        }}
                        style={{ zIndex: 50, cursor: 'grab', position: 'relative', marginTop: '12px', marginRight: '12px' }}
                    >
                    <motion.div
                        animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        style={{ position: 'relative' }}
                    >
                        <Paper onClick={() => setItemToCategorize(item)} sx={{ 
                            px: 1.5, py: 1.8, 
                            borderRadius: '40% 40% 50% 50% / 40% 40% 60% 60%', // Cat face shape
                            bgcolor: '#fff', textAlign: 'center', boxShadow: 3, 
                            border: '2px dashed #ff9800', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
                            alignItems: 'center', justifyContent: 'center', minWidth: '90px', position: 'relative',
                            '&::before': { // Left ear
                                content: '""', position: 'absolute', top: '-10px', left: '10px',
                                width: '22px', height: '22px', bgcolor: '#fff',
                                borderTop: '2px dashed #ff9800', borderLeft: '2px dashed #ff9800',
                                borderRadius: '4px', transform: 'rotate(15deg)', zIndex: -1,
                            },
                            '&::after': { // Right ear
                                content: '""', position: 'absolute', top: '-10px', right: '10px',
                                width: '22px', height: '22px', bgcolor: '#fff',
                                borderTop: '2px dashed #ff9800', borderRight: '2px dashed #ff9800',
                                borderRadius: '4px', transform: 'rotate(-15deg)', zIndex: -1,
                            }
                        }}>
                            <Typography variant="caption" sx={{ color: '#ff9800', display: 'block', mb: 0.1, fontWeight: 'bold', fontSize: '0.6rem' }}>CHƯA PHÂN LOẠI</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>{getTransactionKeyword(item.title)}</Typography>
                        </Paper>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExpense(item._id);
                            }}
                            sx={{
                                position: 'absolute',
                                top: -12,
                                right: -16,
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
                    </motion.div>
                ))}
            </AnimatePresence>
        </Box>
    );
}
