import { Box, Typography, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TRAVEL_CATEGORIES, formatFullVND } from '../travelConfig';

export default function ExpenseItem({ expense, onDelete, onEdit }) {
    const cat = TRAVEL_CATEGORIES[expense.category] || TRAVEL_CATEGORIES['khác'];

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            py: 1.2, px: 1.5, borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            mb: 1,
            transition: 'box-shadow 0.15s',
            '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }
        }}>
            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} fontSize={14} sx={{ wordBreak: 'break-word' }}>{expense.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>

                    {(expense.user_id?.name || expense.paid_by) && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 100 }}>
                            👤 {expense.user_id?.name || expense.paid_by}
                        </Typography>
                    )}
                    {expense.note && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 80 }}>
                            · {expense.note}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Amount */}
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography fontWeight={900} fontSize={15} sx={{ color: cat.color }}>
                    {formatFullVND(expense.amount)}
                </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <IconButton size="small" onClick={() => onDelete(expense._id)} sx={{ color: '#ef4444', '&:hover': { color: '#dc2626' } }}>
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
        </Box>
    );
}
