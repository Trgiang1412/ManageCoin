import { Box, IconButton, Avatar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupsIcon from '@mui/icons-material/Groups';

export default function Header({ user, setDrawerOpen, familyData, onOpenCreate, onOpenMembers }) {
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
                <IconButton onClick={onOpenMembers} sx={{ position: 'absolute', right: 0, width: 44, height: 44, bgcolor: '#e0f7fa', color: '#0097a7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 3, '&:hover': { bgcolor: '#b2ebf2' } }}>
                    <GroupsIcon />
                </IconButton>
            ) : (
                <IconButton onClick={onOpenCreate} sx={{ position: 'absolute', right: 0, width: 44, height: 44, bgcolor: '#fff3e0', color: '#f57c00', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 3, '&:hover': { bgcolor: '#ffe0b2' } }}>
                    <GroupAddIcon />
                </IconButton>
            )}
        </Box>
    );
}
