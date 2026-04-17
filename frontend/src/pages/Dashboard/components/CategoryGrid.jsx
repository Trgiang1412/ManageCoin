import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function CategoryGrid({ dbCategories, transactions, recentAddedIds, categoryConfig, categoryTotals, setSelectedCategoryName, getTransactionKeyword, formatCurrencyShort }) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, pt: 4 }}>
            {dbCategories.map((dbCat) => {
                const key = dbCat.category_name;
                const config = categoryConfig[key] || { icon: '📦', color: '#E2E3E5', name: key.toUpperCase() };
                
                // Find recent items for this category to display as drag bubbles
                const catItems = transactions.filter(t => t.category_name === key && recentAddedIds.includes(t._id)).slice(-2);

                return (
                    <Box key={dbCat._id || key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {/* Render click-to-categorize transaction items assigned to this category */}
                        <Box sx={{ position: 'absolute', top: -30, width: '100%', height: 40 }}>
                            {catItems.map((item, idx) => (
                                <motion.div
                                    key={item._id || idx}
                                    drag
                                    dragSnapToOrigin={true}
                                    dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                                    whileDrag={{ scale: 1.1, zIndex: 100 }}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    style={{ position: 'absolute', top: idx * -15, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 10 + idx, cursor: 'grab', filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.15))' }}
                                >
                                    <Box sx={{ 
                                        p: '8px 16px', 
                                        borderRadius: '20px', 
                                        bgcolor: '#fff', 
                                        textAlign: 'center', 
                                        position: 'relative',
                                        minWidth: '110%',
                                        maxWidth: '150%',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: '-8px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            borderWidth: '8px 8px 0',
                                            borderStyle: 'solid',
                                            borderColor: '#fff transparent transparent transparent',
                                        }
                                    }}>
                                        <Typography variant="caption" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#111', display: 'block', wordBreak: 'break-word', lineHeight: 1.2 }}>
                                            {getTransactionKeyword(item.content)}
                                        </Typography>
                                    </Box>
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
    );
}
