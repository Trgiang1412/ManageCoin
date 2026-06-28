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
            {/* Category icon */}
            <Box sx={{
                width: 44, height: 44, borderRadius: 2.5,
                bgcolor: cat.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
                border: `1.5px solid ${cat.color}22`
            }}>
                {cat.icon}
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} fontSize={14} noWrap>{expense.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                    <Typography variant="caption" sx={{
                        color: cat.color, fontWeight: 700, bgcolor: cat.bg,
                        px: 1, py: 0.2, borderRadius: 99, fontSize: 10
                    }}>
                        {cat.label}
                    </Typography>
                    {expense.paid_by && (
                        <Typography variant="caption" color="text.secondary">
                            👤 {expense.paid_by}
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
