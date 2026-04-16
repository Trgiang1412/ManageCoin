import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, CircularProgress } from '@mui/material';

export default function DeleteConfirmDialog({ deleteConfirmOpen, setDeleteConfirmOpen, confirmDeleteTransaction, loading }) {
    return (
        <Dialog open={deleteConfirmOpen} onClose={() => !loading && setDeleteConfirmOpen(false)}>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogContent>
                <Typography>
                    Bạn có chắc chắn muốn xóa khoản này? Hành động này không thể hoàn tác.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={loading}>Hủy</Button>
                <Button onClick={confirmDeleteTransaction} variant="contained" color="error" disabled={loading} autoFocus>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Xóa'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
