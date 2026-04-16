import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, CircularProgress, TextField } from '@mui/material';

export default function CreateFamilyDialog({ open, onClose, onCreate, loading }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) onCreate(name);
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="xs">
            <DialogTitle>Tạo Nhóm Gia Đình</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Tạo một gia đình để dùng chung sổ quỹ và quản lý chi tiêu.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Tên gia đình"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading} color="inherit">Hủy</Button>
                    <Button type="submit" variant="contained" disabled={loading || !name.trim()}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Tạo'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
