import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, ToggleButtonGroup, ToggleButton, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FUND_COLORS } from '../travelConfig';

const EMOJIS = ['✈️','🏖','🏔','🗺','🚂','🛳','🏕','🌍','🎒','🗼','🏯','🌸'];

export default function AddFundDialog({ open, onClose, onSave, loading, editData = null }) {
    const [form, setForm] = useState(() => editData || {
        name: '', destination: '', description: '',
        cover_emoji: '✈️', budget: '', start_date: '', end_date: '',
        color: FUND_COLORS[0].color, status: 'planning'
    });

    // Sync when editData changes
    useState(() => { if (editData) setForm(editData); }, [editData]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = () => {
        if (!form.name.trim()) return;
        onSave({
            ...form,
            budget: Number(form.budget) || 0,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { mx: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
                <Typography fontWeight={800} fontSize={18}>
                    {editData ? '✏️ Sửa quỹ' : '✈️ Tạo quỹ du lịch'}
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Emoji picker */}
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>ICON CHUYẾN ĐI</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {EMOJIS.map(e => (
                            <Box key={e} onClick={() => set('cover_emoji', e)} sx={{
                                width: 40, height: 40, borderRadius: 2, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer',
                                border: form.cover_emoji === e ? '2.5px solid #6366f1' : '2px solid #f0f0f0',
                                bgcolor: form.cover_emoji === e ? '#f0f0ff' : 'white',
                                transition: 'all 0.15s',
                            }}>{e}</Box>
                        ))}
                    </Box>
                </Box>

                {/* Color picker */}
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>MÀU THẺ</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {FUND_COLORS.map(c => (
                            <Box key={c.color} onClick={() => set('color', c.color)} sx={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: c.gradient, cursor: 'pointer',
                                border: form.color === c.color ? '3px solid #1c1917' : '3px solid transparent',
                                boxShadow: form.color === c.color ? `0 0 0 2px white, 0 0 0 4px ${c.color}` : 'none',
                                transition: 'all 0.15s',
                            }} />
                        ))}
                    </Box>
                </Box>

                <TextField label="Tên chuyến đi *" value={form.name} onChange={e => set('name', e.target.value)}
                    fullWidth size="small" inputProps={{ maxLength: 60 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField label="Điểm đến" value={form.destination} onChange={e => set('destination', e.target.value)}
                    fullWidth size="small" placeholder="Hà Nội, Đà Nẵng..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField label="Mô tả" value={form.description} onChange={e => set('description', e.target.value)}
                    fullWidth size="small" multiline rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField label="Ngân sách (đ)" value={form.budget} onChange={e => set('budget', e.target.value)}
                    fullWidth size="small" type="number" placeholder="0 = không giới hạn"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Ngày đi" value={form.start_date ? form.start_date.slice(0,10) : ''}
                        onChange={e => set('start_date', e.target.value)} type="date"
                        fullWidth size="small" InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField label="Ngày về" value={form.end_date ? form.end_date.slice(0,10) : ''}
                        onChange={e => set('end_date', e.target.value)} type="date"
                        fullWidth size="small" InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2, flex: 1 }} variant="outlined" color="inherit">Hủy</Button>
                <Button onClick={handleSave} disabled={loading || !form.name.trim()}
                    variant="contained" sx={{
                        borderRadius: 2, flex: 2, fontWeight: 700,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                        '&:hover': { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
                    }}
                >
                    {editData ? 'Lưu thay đổi' : '🚀 Tạo quỹ'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
