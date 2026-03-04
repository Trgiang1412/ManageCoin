import { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const res = await axios.post(`http://localhost:5000${endpoint}`, {
                username,
                password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/'; // Force reload to update auth state
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 4, textAlign: 'center' }}>
                <Typography component="h1" variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    Managecoin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to track your expenses.'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
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
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => setIsLogin(!isLogin)}
                        sx={{ color: 'text.secondary' }}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
