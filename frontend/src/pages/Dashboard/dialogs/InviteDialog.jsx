import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, CircularProgress } from '@mui/material';

export default function InviteDialog({ inviteData, onAccept, onReject, loading }) {
    if (!inviteData) return null;

    return (
        <Dialog open={!!inviteData} disableEscapeKeyDown>
            <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold', pb: 1 }}>Lời mời tham gia Gia đình</DialogTitle>
            <DialogContent>
                <Typography mt={1} variant="body2">
                    Bạn vừa nhận được lời mời tham gia vào nhóm gia đình: <b>{inviteData.name}</b>.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Bạn có muốn tham gia nhóm này không?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onReject} disabled={loading} color="inherit">Từ chối</Button>
                <Button onClick={onAccept} variant="contained" disabled={loading} color="primary">
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Đồng ý'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
