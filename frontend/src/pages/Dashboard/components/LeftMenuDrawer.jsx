import { Box, Drawer, Avatar, Typography, Divider, List as MuiList, ListItem, ListItemButton, ListItemIcon, ListItemText, Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SavingsIcon from '@mui/icons-material/Savings';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

export default function LeftMenuDrawer({ drawerOpen, setDrawerOpen, user, setSettingsAnchorEl, handleLogout }) {
    return (
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation" onClick={() => setDrawerOpen(false)} onKeyDown={() => setDrawerOpen(false)}>
                <Box sx={{ p: 3, pt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#FAFAFA' }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#C8E6C9', mb: 2, boxShadow: 2 }} src={user.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} />
                    <Typography variant="subtitle1" fontWeight="bold">{user.name || 'User'}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MuiList sx={{ p: 2, flex: 1 }}>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton sx={{ borderRadius: 2, bgcolor: '#f0fdf4', color: '#166534' }}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><AccountBalanceWalletIcon /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight="bold">Chi tiêu hàng ngày</Typography>} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton sx={{ borderRadius: 2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}><FlightTakeoffIcon sx={{ color: '#0284c7' }} /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight="500">Du lịch</Typography>} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton sx={{ borderRadius: 2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}><SavingsIcon sx={{ color: '#ec4899' }} /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight="500">Tiết kiệm</Typography>} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton sx={{ borderRadius: 2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}><BarChartIcon sx={{ color: '#8b5cf6' }} /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight="500">Thống kê</Typography>} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{ borderRadius: 2 }} onClick={(e) => setSettingsAnchorEl(e.currentTarget)}>
                            <ListItemIcon sx={{ minWidth: 40 }}><SettingsIcon sx={{ color: '#FF9800' }} /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight="500">Cài đặt</Typography>} />
                        </ListItemButton>
                    </ListItem>
                </MuiList>
                <Box sx={{ p: 2, pb: 4 }}>
                    <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
                        Đăng xuất
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
