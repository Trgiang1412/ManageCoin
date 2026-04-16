import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Avatar, InputBase, IconButton, CircularProgress, List as MuiList, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

export default function FamilyMembersDialog({ open, onClose, familyData, onInvite, loading }) {
    const [email, setEmail] = useState('');

    const handleInvite = (e) => {
        e.preventDefault();
        if (email.trim()) {
            onInvite(email);
            setEmail('');
        }
    };

    if (!familyData) return null;

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{familyData.name}</Typography>
                <IconButton onClick={onClose} size="small" disabled={loading}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Thêm thành viên</Typography>
                <Box component="form" onSubmit={handleInvite} sx={{ display: 'flex', alignItems: 'center', p: '2px 4px', mb: 3, border: '1px solid #ddd', borderRadius: 2 }}>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Nhập email cần mời..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        type="email"
                        required
                    />
                    <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={loading || !email.trim()}>
                        {loading ? <CircularProgress size={24} /> : <SendIcon />}
                    </IconButton>
                </Box>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Danh sách thành viên ({familyData.members?.length || 0})</Typography>
                <MuiList disablePadding>
                    {familyData.members?.map(member => (
                        <ListItem key={member._id} disableGutters>
                            <ListItemAvatar>
                                <Avatar src={member.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} />
                            </ListItemAvatar>
                            <ListItemText 
                                primary={member.name} 
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                                secondary={member.email} 
                            />
                            {familyData.user_id === member._id && (
                                <Typography variant="caption" sx={{ bgcolor: '#e0f2f1', color: '#00897b', px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>Trưởng nhóm</Typography>
                            )}
                        </ListItem>
                    ))}
                </MuiList>
            </DialogContent>
        </Dialog>
    );
}
