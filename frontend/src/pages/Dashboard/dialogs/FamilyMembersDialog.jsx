import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Typography, Box, Avatar,
    InputBase, IconButton, CircularProgress, List as MuiList,
    ListItem, ListItemAvatar, ListItemText, Button, Divider,
    Chip, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function FamilyMembersDialog({
    open, onClose, familyData, onInvite, loading,
    currentUserId, onLeave, onRemoveMember, onDissolve
}) {
    const [email, setEmail] = useState('');
    const [dissolveConfirm, setDissolveConfirm] = useState(false);

    const handleInvite = (e) => {
        e.preventDefault();
        if (email.trim()) {
            onInvite(email);
            setEmail('');
        }
    };

    if (!familyData) return null;

    const isOwner = familyData.user_id === currentUserId ||
        familyData.user_id?._id === currentUserId ||
        familyData.user_id?.toString() === currentUserId;

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">{familyData.name}</Typography>
                    <Chip
                        size="small"
                        label={isOwner ? '👑 Chủ nhóm' : '👤 Thành viên'}
                        sx={{
                            bgcolor: isOwner ? '#fff8e1' : '#e3f2fd',
                            color: isOwner ? '#f57f17' : '#1565c0',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 20,
                            mt: 0.5
                        }}
                    />
                </Box>
                <IconButton onClick={onClose} size="small" disabled={loading}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2 }}>
                {/* Invite form - chỉ chủ nhóm */}
                {isOwner && (
                    <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Mời thành viên qua email
                        </Typography>
                        <Box component="form" onSubmit={handleInvite} sx={{ display: 'flex', alignItems: 'center', p: '2px 4px', mb: 2, border: '1px solid #ddd', borderRadius: 2 }}>
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
                        <Divider sx={{ mb: 2 }} />
                    </>
                )}

                {/* Danh sách thành viên */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Danh sách thành viên ({familyData.members?.length || 0})
                </Typography>
                <MuiList disablePadding>
                    {familyData.members?.map(member => {
                        const memberId = member._id || member;
                        const isThisMemberOwner = familyData.user_id === memberId ||
                            familyData.user_id?.toString() === memberId?.toString();
                        const isMe = memberId?.toString() === currentUserId;

                        return (
                            <ListItem
                                key={memberId}
                                disableGutters
                                sx={{
                                    bgcolor: isMe ? '#f0f9ff' : 'transparent',
                                    borderRadius: 1,
                                    px: 1,
                                    mb: 0.5
                                }}
                                secondaryAction={
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        {isThisMemberOwner && (
                                            <Chip
                                                size="small"
                                                label="Trưởng nhóm"
                                                sx={{ bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 'bold', fontSize: '0.65rem' }}
                                            />
                                        )}
                                        {/* Chủ nhóm có thể xóa thành viên khác */}
                                        {isOwner && !isThisMemberOwner && (
                                            <Tooltip title="Xóa thành viên">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => onRemoveMember(familyData._id, memberId)}
                                                    disabled={loading}
                                                >
                                                    <PersonRemoveIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {/* Thành viên không phải chủ nhóm có thể tự rời */}
                                        {isMe && !isOwner && (
                                            <Tooltip title="Rời nhóm">
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => onLeave(familyData._id)}
                                                    disabled={loading}
                                                >
                                                    <ExitToAppIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar src={member.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography fontWeight="bold" variant="body2">
                                            {member.name} {isMe && <span style={{ color: '#999', fontSize: '0.75rem' }}>(Bạn)</span>}
                                        </Typography>
                                    }
                                    secondary={member.email}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                />
                            </ListItem>
                        );
                    })}
                </MuiList>

                {/* Giải tán nhóm - chỉ chủ nhóm */}
                {isOwner && (
                    <>
                        <Divider sx={{ mt: 2, mb: 2 }} />
                        {!dissolveConfirm ? (
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteForeverIcon />}
                                onClick={() => setDissolveConfirm(true)}
                                disabled={loading}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Giải tán nhóm
                            </Button>
                        ) : (
                            <Box sx={{ border: '1px solid #ffcdd2', borderRadius: 2, p: 1.5, bgcolor: '#fff8f8' }}>
                                <Typography variant="body2" color="error" fontWeight="bold" sx={{ mb: 1 }}>
                                    ⚠️ Xác nhận giải tán nhóm "{familyData.name}"?
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                    Tất cả thành viên sẽ bị xóa khỏi nhóm. Dữ liệu giao dịch vẫn được giữ lại.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" variant="outlined" onClick={() => setDissolveConfirm(false)} disabled={loading} sx={{ flex: 1, borderRadius: 1.5, textTransform: 'none' }}>
                                        Huỷ
                                    </Button>
                                    <Button size="small" variant="contained" color="error" onClick={() => onDissolve(familyData._id)} disabled={loading} sx={{ flex: 1, borderRadius: 1.5, textTransform: 'none' }}>
                                        {loading ? <CircularProgress size={18} color="inherit" /> : 'Giải tán'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
