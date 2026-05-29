import { useState } from 'react';
import { Box, IconButton, Avatar, Typography, Menu, MenuItem, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import PaymentIcon from '@mui/icons-material/Payment';
import CallSplitIcon from '@mui/icons-material/CallSplit';

export default function Header({ user, setDrawerOpen, familyData, onOpenCreate, onOpenMembers }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenMembers = () => {
        handleClose();
        if (onOpenMembers) onOpenMembers();
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center' }}>
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ position: 'absolute', left: 0, width: 44, height: 44, bgcolor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 3, '&:hover': { bgcolor: '#F0F0F0' } }}>
                <MenuIcon sx={{ color: '#555' }} />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#C8E6C9', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} src={user.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} />
                <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Xin chào,</Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, color: '#333' }}>{user.name || 'User'}</Typography>
                </Box>
            </Box>

            {familyData ? (
                <>
                    <IconButton 
                        onClick={handleClick}
                        sx={{ position: 'absolute', right: 0, width: 44, height: 44, bgcolor: '#e0f7fa', color: '#0097a7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 3, '&:hover': { bgcolor: '#b2ebf2' } }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                                mt: 1.5,
                                '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                                '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                            }
                        }}
                    >
                        <MenuItem onClick={handleOpenMembers}>
                            <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon> Mời thành viên
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon> Lịch sử
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon><PaymentIcon fontSize="small" /></ListItemIcon> Đóng góp
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon><CallSplitIcon fontSize="small" /></ListItemIcon> Chia tiền
                        </MenuItem>
                    </Menu>
                </>
            ) : (
                <IconButton onClick={onOpenCreate} sx={{ position: 'absolute', right: 0, width: 44, height: 44, bgcolor: '#fff3e0', color: '#f57c00', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 3, '&:hover': { bgcolor: '#ffe0b2' } }}>
                    <GroupAddIcon />
                </IconButton>
            )}
        </Box>
    );
}
