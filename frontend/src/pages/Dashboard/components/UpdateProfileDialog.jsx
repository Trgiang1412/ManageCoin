import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Avatar, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

export default function UpdateProfileDialog({ open, onClose, user, onUpdateSuccess }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && user) {
            setName(user.name || '');
            setImage(user.image || '');
        }
    }, [open, user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    // Tạo canvas để nén và resize ảnh
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Chuyển lại thành base64 với định dạng jpeg và chất lượng 0.7 (70%)
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setImage(compressedBase64);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage('');
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_BASE_URL}/auth/me`, { name, image }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onUpdateSuccess(res.data);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle fontWeight="bold">Cập nhật thông tin</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar src={image || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} sx={{ width: 100, height: 100, boxShadow: 2 }} />
                        
                        {/* Remove Image Button */}
                        {image && (
                            <IconButton 
                                onClick={handleRemoveImage}
                                size="small"
                                sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#ffebee', color: '#f44336' }, p: 0.5 }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}

                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="icon-button-file"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="icon-button-file">
                            <IconButton color="primary" aria-label="upload picture" component="span" sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f0f0f0' } }}>
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    </Box>
                </Box>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Tên hiển thị"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">Hủy</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading} sx={{ borderRadius: 2 }}>
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
}
