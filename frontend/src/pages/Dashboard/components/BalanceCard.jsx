import { Paper, IconButton, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function BalanceCard({ balance, setOpenFinishMonthDialog }) {
    return (
        <Paper elevation={0} sx={{ position: 'relative', py: 2, px: 3, borderRadius: 4, bgcolor: '#FFF', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
                onClick={() => setOpenFinishMonthDialog(true)}
                sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#f0fdf4', color: '#4CAF50', '&:hover': { bgcolor: '#e8f5e9' }, width: 32, height: 32 }}
                size="small"
                title="Chốt tháng"
            >
                <RestartAltIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, mb: 0 }}>SỐ DƯ CÒN LẠI</Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#10b981', mt: 0.5, letterSpacing: -0.5 }}>
                {balance.toLocaleString('vi-VN')}đ
            </Typography>
        </Paper>
    );
}
