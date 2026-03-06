import { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Login() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : { name, email, password };

            const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/'; // Force reload to update auth state
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 4, textAlign: 'center' }}>
                <Typography component="h1" variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    Managecoin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {isLogin ? 'Chào mừng trở lại! Vui lòng đăng nhập.' : 'Tạo tài khoản mới để theo dõi chi tiêu.'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {!isLogin && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Họ và Tên"
                            name="name"
                            autoComplete="name"
                            autoFocus={!isLogin}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Địa chỉ Email"
                        name="email"
                        autoComplete="email"
                        autoFocus={isLogin}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mật khẩu"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disableElevation
                        sx={{ py: 1.5, mb: 2, borderRadius: 2 }}
                    >
                        {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={toggleMode}
                        sx={{ color: 'text.secondary' }}
                    >
                        {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

