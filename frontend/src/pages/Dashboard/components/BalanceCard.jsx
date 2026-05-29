import { Paper, IconButton, Typography, Box } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function BalanceCard({ balance, monthlyLimit, setOpenFinishMonthDialog }) {
    return (
        <Paper elevation={0} sx={{ position: 'relative', overflow: 'visible', py: 2, px: 3, borderRadius: 4, bgcolor: '#FFF', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{
                position: 'absolute',
                top: '-32px',
                width: '32px',
                height: '32px',
                animation: 'runCat 6s linear infinite',
                '@keyframes runCat': {
                    '0%': { left: '-40px' },
                    '100%': { left: '100%' }
                },
                zIndex: 2, // Ensure it is above other elements
                pointerEvents: 'none', // So it doesn't block clicks
                mixBlendMode: 'multiply'
            }}>
                <img 
                    src="/cat.gif" 
                    alt="running cat" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
            </Box>
            <IconButton
                onClick={() => setOpenFinishMonthDialog(true)}
                sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#f0fdf4', color: '#4CAF50', '&:hover': { bgcolor: '#e8f5e9' }, width: 32, height: 32, zIndex: 1 }}
                size="small"
                title="Chốt tháng"
            >
                <RestartAltIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, mb: 0, position: 'relative', zIndex: 1 }}>SỐ DƯ CÒN LẠI</Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: balance < 0 ? 'error.main' : '#10b981', mt: 0.5, letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>
                {balance.toLocaleString('vi-VN')}đ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, position: 'relative', zIndex: 1 }}>
                Hạn mức tháng: {monthlyLimit ? monthlyLimit.toLocaleString('vi-VN') : 0}đ
            </Typography>
        </Paper>
    );
}
