import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress, Box, Avatar } from '@mui/material';

export default function TravelInviteDialog({ open, onClose, onInvite, loading, fund }) {
    const [email, setEmail] = useState('');

    const handleSubmit = () => {
        if (!email) return;
        onInvite(email);
        setEmail('');
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { mx: 2, width: '100%' } }}>
            <DialogTitle fontWeight={800}>Mời thành viên</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Nhập email của người bạn muốn mời vào quỹ <b>{fund?.name}</b>. Họ sẽ có thể xem, thêm chi tiêu và đóng góp quỹ.
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    id="email"
                    label="Địa chỉ Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    disabled={loading}
                />

                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 4, mb: 1 }}>Thành viên hiện tại ({fund?.members?.length || 0})</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {fund?.members?.map((m) => (
                        <Box key={m.user_id} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 2, bgcolor: '#f8fafc' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#e2e8f0', color: '#475569', fontSize: 14 }}>
                                {m.name ? m.name[0].toUpperCase() : '?'}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{m.role === 'owner' ? 'Trưởng nhóm' : 'Thành viên'}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary', fontWeight: 600 }}>Đóng</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!email || loading} sx={{ borderRadius: 2, bgcolor: '#222B45', color: '#fff', '&:hover': { bgcolor: '#1a2238' }, fontWeight: 600 }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi lời mời'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
