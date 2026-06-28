import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TRAVEL_CATEGORIES } from '../travelConfig';

export default function AddExpenseDialog({ open, onClose, onSave, loading, editData = null }) {
    const [form, setForm] = useState({
        title: '', amount: '', category: 'ăn_uống', note: '',
        date: new Date().toISOString().slice(0, 10), paid_by: ''
    });

    useEffect(() => {
        if (editData) {
            setForm({
                title: editData.title || '',
                amount: editData.amount || '',
                category: editData.category || 'ăn_uống',
                note: editData.note || '',
                date: editData.date ? editData.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
                paid_by: editData.paid_by || '',
            });
        } else {
            setForm({
                title: '', amount: '', category: 'ăn_uống', note: '',
                date: new Date().toISOString().slice(0, 10), paid_by: ''
            });
        }
    }, [editData, open]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = () => {
        if (!form.title.trim() || !form.amount) return;
        onSave({ ...form, amount: Number(form.amount) });
    };

    const catConfig = TRAVEL_CATEGORIES[form.category];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { mx: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
                <Typography fontWeight={800} fontSize={18}>
                    {editData ? '✏️ Sửa chi tiêu' : '💸 Thêm chi tiêu'}
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Category selector */}
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>DANH MỤC</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {Object.entries(TRAVEL_CATEGORIES).map(([key, cfg]) => (
                            <Box key={key} onClick={() => set('category', key)} sx={{
                                display: 'flex', alignItems: 'center', gap: 0.5,
                                px: 1.5, py: 0.7, borderRadius: 99, cursor: 'pointer',
                                fontSize: 13, fontWeight: 600,
                                border: form.category === key ? `2px solid ${cfg.color}` : '2px solid #e5e7eb',
                                bgcolor: form.category === key ? cfg.bg : 'white',
                                color: form.category === key ? cfg.color : '#6b7280',
                                transition: 'all 0.15s',
                            }}>
                                <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                                {cfg.label}
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Amount — prominent */}
                <Box sx={{
                    borderRadius: 3,
                    bgcolor: catConfig.bg,
                    border: `2px solid ${catConfig.color}33`,
                    p: 2, textAlign: 'center'
                }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, display: 'block', mb: 0.5 }}>
                        {catConfig.icon} SỐ TIỀN (VNĐ)
                    </Typography>
                    <TextField
                        value={form.amount}
                        onChange={e => set('amount', e.target.value)}
                        type="number"
                        placeholder="0"
                        variant="standard"
                        inputProps={{ style: { fontSize: 32, fontWeight: 900, textAlign: 'center', color: catConfig.color } }}
                        sx={{ '& .MuiInput-underline:before': { borderColor: catConfig.color + '44' }, width: '100%' }}
                    />
                    {form.amount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            {Number(form.amount).toLocaleString('vi-VN')}đ
                        </Typography>
                    )}
                </Box>

                <TextField label="Tiêu đề *" value={form.title} onChange={e => set('title', e.target.value)}
                    fullWidth size="small" placeholder="Ăn phở bò, Vé xe bus..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField label="Ghi chú" value={form.note} onChange={e => set('note', e.target.value)}
                    fullWidth size="small" multiline rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Ngày" value={form.date} onChange={e => set('date', e.target.value)}
                        type="date" fullWidth size="small" InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField label="Người trả" value={form.paid_by} onChange={e => set('paid_by', e.target.value)}
                        fullWidth size="small" placeholder="Tên..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2, flex: 1 }} variant="outlined" color="inherit">Hủy</Button>
                <Button
                    onClick={handleSave}
                    disabled={loading || !form.title.trim() || !form.amount}
                    variant="contained"
                    sx={{
                        borderRadius: 2, flex: 2, fontWeight: 700,
                        background: `linear-gradient(135deg,${catConfig.color},${catConfig.color}cc)`,
                        boxShadow: `0 4px 14px ${catConfig.color}44`,
                        '&:hover': { filter: 'brightness(1.1)' }
                    }}
                >
                    {editData ? 'Lưu' : '+ Thêm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
