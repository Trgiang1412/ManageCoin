import { useState } from 'react';
import {
    Box, IconButton, Avatar, Typography, Menu, MenuItem,
    ListItemIcon, Divider, Chip, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Header({ user, setDrawerOpen, familyData, myFamilies, activeFamilyId, onOpenCreate, onOpenMembers, onSwitchFamily }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [switchAnchorEl, setSwitchAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const switchOpen = Boolean(switchAnchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleOpenMembers = () => {
        handleClose();
        if (onOpenMembers) onOpenMembers();
    };

    const handleSwitchClick = (event) => {
        event.stopPropagation();
        setSwitchAnchorEl(event.currentTarget);
    };

    const handleSwitchClose = () => setSwitchAnchorEl(null);

    const handleSwitchFamily = (familyId) => {
        handleSwitchClose();
        if (onSwitchFamily) onSwitchFamily(familyId);
    };

    const hasMultipleFamilies = myFamilies && myFamilies.length > 1;

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

            {/* Right side: family button */}
            {familyData ? (
                <>
                    {/* Family name chip + menu button */}
                    <Box sx={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {/* Nếu có nhiều family → hiện switch button */}
                        {hasMultipleFamilies && (
                            <Tooltip title="Đổi nhóm gia đình">
                                <IconButton
                                    onClick={handleSwitchClick}
                                    size="small"
                                    sx={{
                                        bgcolor: '#f3e8ff',
                                        color: '#7c3aed',
                                        width: 32,
                                        height: 32,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#ede9fe' }
                                    }}
                                >
                                    <SwapHorizIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton
                            onClick={handleClick}
                            sx={{
                                width: 44, height: 44,
                                bgcolor: '#e0f7fa', color: '#0097a7',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                borderRadius: 3,
                                '&:hover': { bgcolor: '#b2ebf2' },
                                flexDirection: 'column',
                                gap: 0
                            }}
                        >
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold', lineHeight: 1, maxWidth: 36, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {familyData.name?.slice(0, 6)}
                            </Typography>
                            <MoreVertIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>

                    {/* Family actions menu */}
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
                                '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                            }
                        }}
                    >
                        <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
                            <Typography variant="caption" color="text.secondary">Nhóm hiện tại</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">🏠 {familyData.name}</Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleOpenMembers}>
                            <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                            Mời & quản lý thành viên
                        </MenuItem>
                        <MenuItem onClick={() => { handleClose(); onOpenCreate && onOpenCreate(); }} sx={{ color: '#f57c00' }}>
                            <ListItemIcon><GroupAddIcon fontSize="small" sx={{ color: '#f57c00' }} /></ListItemIcon>
                            Tạo nhóm gia đình mới
                        </MenuItem>
                    </Menu>

                    {/* Switch family menu */}
                    <Menu
                        anchorEl={switchAnchorEl}
                        open={switchOpen}
                        onClose={handleSwitchClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                                mt: 1.5,
                                minWidth: 200,
                                '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                            }
                        }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                CHUYỂN NHÓM GIA ĐÌNH
                            </Typography>
                        </Box>
                        <Divider />
                        {myFamilies?.map(f => {
                            const isActive = f._id === activeFamilyId || f._id?.toString() === activeFamilyId?.toString();
                            return (
                                <MenuItem
                                    key={f._id}
                                    onClick={() => !isActive && handleSwitchFamily(f._id)}
                                    selected={isActive}
                                    sx={{
                                        py: 1.2,
                                        bgcolor: isActive ? '#e0f7fa !important' : 'transparent',
                                        '&:hover': { bgcolor: isActive ? '#e0f7fa' : '#f5f5f5' }
                                    }}
                                >
                                    <ListItemIcon>
                                        {isActive
                                            ? <CheckCircleIcon fontSize="small" color="primary" />
                                            : <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🏠</Box>
                                        }
                                    </ListItemIcon>
                                    <Box>
                                        <Typography variant="body2" fontWeight={isActive ? 'bold' : 'normal'}>
                                            {f.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {f.members?.length || 0} thành viên
                                        </Typography>
                                    </Box>
                                    {isActive && (
                                        <Chip size="small" label="Active" color="primary" sx={{ ml: 'auto', height: 18, fontSize: '0.6rem' }} />
                                    )}
                                </MenuItem>
                            );
                        })}
                        <Divider />
                        <MenuItem onClick={() => { handleSwitchClose(); onOpenCreate && onOpenCreate(); }} sx={{ color: '#f57c00' }}>
                            <ListItemIcon><GroupAddIcon fontSize="small" sx={{ color: '#f57c00' }} /></ListItemIcon>
                            <Typography variant="body2">Tạo nhóm mới</Typography>
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
