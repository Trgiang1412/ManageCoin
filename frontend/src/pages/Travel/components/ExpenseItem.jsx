import { Box, Typography, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TRAVEL_CATEGORIES, formatFullVND } from '../travelConfig';

export default function ExpenseItem({ expense, onDelete, onEdit }) {
    const cat = TRAVEL_CATEGORIES[expense.category] || TRAVEL_CATEGORIES['khác'];

    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column',
            py: 1.2, px: 1.5, borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            mb: 1,
            transition: 'box-shadow 0.15s',
            '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14} sx={{ wordBreak: 'break-word' }}>{expense.title}</Typography>
                    {expense.note && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block', mt: 0.3 }}>
                            · {expense.note}
                        </Typography>
                    )}
                </Box>

                {/* Amount */}
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography fontWeight={900} fontSize={15} sx={{ color: cat.color }}>
                        {formatFullVND(expense.amount)}
                    </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <IconButton size="small" onClick={() => onDelete(expense._id)} sx={{ color: '#ef4444', '&:hover': { color: '#dc2626' }, mr: -0.5 }}>
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Footer */}
            {(expense.user_id?.name || expense.paid_by) && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        👤 {expense.user_id?.name || expense.paid_by}
                        {expense.date && ` - ${new Date(expense.date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
