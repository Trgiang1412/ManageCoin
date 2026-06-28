import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, CircularProgress, Box, Chip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

export default function InviteDialog({ inviteData, onAccept, onReject, loading }) {
    // inviteData là mảng các family [{_id, name}, ...]
    const invites = Array.isArray(inviteData) ? inviteData : (inviteData ? [inviteData] : []);

    if (invites.length === 0) return null;

    // Hiển thị lời mời đầu tiên (chưa xử lý)
    const currentInvite = invites[0];

    return (
        <Dialog open={invites.length > 0} disableEscapeKeyDown>
            <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                Lời mời tham gia Gia đình
                {invites.length > 1 && (
                    <Chip
                        size="small"
                        label={`${invites.length} lời mời`}
                        color="warning"
                        sx={{ ml: 'auto', fontWeight: 'bold' }}
                    />
                )}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ bgcolor: '#f0f9ff', borderRadius: 2, p: 2, mb: 1.5, border: '1px solid #bae6fd' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Nhóm gia đình
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                        🏠 {currentInvite.name}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Bạn có muốn tham gia nhóm này không?
                </Typography>
                {invites.length > 1 && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                        Còn {invites.length - 1} lời mời khác sau khi xử lý lời mời này.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2 }}>
                <Button
                    onClick={() => onReject(currentInvite._id)}
                    disabled={loading}
                    color="inherit"
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Từ chối
                </Button>
                <Button
                    onClick={() => onAccept(currentInvite._id)}
                    variant="contained"
                    disabled={loading}
                    color="primary"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Đồng ý tham gia'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
