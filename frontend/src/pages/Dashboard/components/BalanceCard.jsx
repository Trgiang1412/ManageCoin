import { Paper, IconButton, Typography, Box } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const Leaf = ({ sx, ...props }) => (
    <Box component="svg" viewBox="0 0 24 24" fill="currentColor" sx={{ width: '1em', height: '1em', ...sx }} {...props}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17 1.04.3 1.71.3C12 20 22 18 22 4C22 4 19 6 17 8z" />
    </Box>
);

export default function BalanceCard({ balance, monthlyLimit, setOpenFinishMonthDialog }) {
    return (
        <Paper elevation={0} sx={{ position: 'relative', overflow: 'visible', py: 2, px: 3, borderRadius: 4, bgcolor: '#FFF', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Dây leo quấn quanh border */}
            <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: 4,
                border: '2px dashed #81c784',
                pointerEvents: 'none',
                zIndex: 0,
            }}>
                {/* Top border vines */}
                <Leaf sx={{ position: 'absolute', top: -10, left: '15%', color: '#4CAF50', transform: 'rotate(45deg)', fontSize: 20 }} />
                <Leaf sx={{ position: 'absolute', top: -6, left: '40%', color: '#81c784', transform: 'rotate(120deg)', fontSize: 16 }} />
                <Leaf sx={{ position: 'absolute', top: -10, right: '25%', color: '#388E3C', transform: 'rotate(-30deg)', fontSize: 18 }} />
                <Leaf sx={{ position: 'absolute', top: -12, right: '10%', color: '#4CAF50', transform: 'rotate(80deg)', fontSize: 16 }} />

                {/* Bottom border vines */}
                <Leaf sx={{ position: 'absolute', bottom: -10, right: '15%', color: '#4CAF50', transform: 'rotate(225deg)', fontSize: 20 }} />
                <Leaf sx={{ position: 'absolute', bottom: -6, right: '40%', color: '#81c784', transform: 'rotate(300deg)', fontSize: 16 }} />
                <Leaf sx={{ position: 'absolute', bottom: -10, left: '25%', color: '#388E3C', transform: 'rotate(150deg)', fontSize: 18 }} />
                <Leaf sx={{ position: 'absolute', bottom: -12, left: '10%', color: '#4CAF50', transform: 'rotate(260deg)', fontSize: 16 }} />

                {/* Left border vines */}
                <Leaf sx={{ position: 'absolute', top: '30%', left: -10, color: '#4CAF50', transform: 'rotate(-45deg)', fontSize: 20 }} />
                <Leaf sx={{ position: 'absolute', bottom: '25%', left: -8, color: '#81c784', transform: 'rotate(-120deg)', fontSize: 16 }} />

                {/* Right border vines */}
                <Leaf sx={{ position: 'absolute', top: '25%', right: -10, color: '#4CAF50', transform: 'rotate(45deg)', fontSize: 20 }} />
                <Leaf sx={{ position: 'absolute', bottom: '30%', right: -8, color: '#81c784', transform: 'rotate(120deg)', fontSize: 16 }} />
            </Box>

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
