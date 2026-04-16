import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, CircularProgress } from '@mui/material';

export default function FinishMonthDialog({ openFinishMonthDialog, setOpenFinishMonthDialog, handleFinishMonth, loading }) {
    return (
        <Dialog open={openFinishMonthDialog} onClose={() => setOpenFinishMonthDialog(false)}>
            <DialogTitle>Xác nhận chốt tháng</DialogTitle>
            <DialogContent>
                <Typography>
                    Bạn có muốn kết thúc tháng chi tiêu hiện tại không?
                    Hành động này sẽ đóng băng các khoản chi hiện tại và tính vào lịch sử tháng.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenFinishMonthDialog(false)} color="inherit" disabled={loading}>Hủy</Button>
                <Button onClick={handleFinishMonth} variant="contained" color="error" disabled={loading} autoFocus>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Chốt tháng'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
