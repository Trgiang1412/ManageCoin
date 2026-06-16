import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, ToggleButton, ToggleButtonGroup, TextField, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useNavigate } from 'react-router-dom';
import LeftMenuDrawer from '../Dashboard/components/LeftMenuDrawer';
import { categoryConfig, formatCurrencyShort } from '../Dashboard/index';
import { API_BASE_URL } from '../../config';

dayjs.extend(isBetween);

export default function Statistics() {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dbCategories, setDbCategories] = useState([]);
    const [statistics, setStatistics] = useState({ totalExpense: 0, details: [] });
    const [loading, setLoading] = useState(true);
    
    // Filter state
    const [filterType, setFilterType] = useState('month'); // 'week', 'month', 'custom'
    const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catRes, statRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/lists/statistics`, { 
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        startDate: dayjs(startDate).startOf('day').toISOString(),
                        endDate: dayjs(endDate).endOf('day').toISOString()
                    }
                })
            ]);
            setDbCategories(catRes.data);
            setStatistics(statRes.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (event, newFilterType) => {
        if (newFilterType !== null) {
            setFilterType(newFilterType);
            if (newFilterType === 'week') {
                setStartDate(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD')); // Monday
                setEndDate(dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD'));
            } else if (newFilterType === 'month') {
                setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'));
                setEndDate(dayjs().endOf('month').format('YYYY-MM-DD'));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Prepare chart data
    const categoryTotals = {};
    
    // Initialize totals for all expense categories to show 0
    dbCategories.filter(c => c.type_category !== 'income' && c.category_name !== 'Hạn mức tháng' && c.category_name !== 'Tiết kiệm').forEach(c => {
        categoryTotals[c.category_name] = 0;
    });

    // Merge API details into categoryTotals
    statistics.details.forEach(d => {
        if (d.category_name !== 'Hạn mức tháng' && d.category_name !== 'Tiết kiệm') {
            categoryTotals[d.category_name] = d.amount;
        }
    });

    const totalExpense = statistics.totalExpense;

    const chartData = Object.keys(categoryTotals).map(catName => {
        const config = categoryConfig[catName] || { color: '#8884d8', icon: '📦' };
        return {
            name: catName,
            amount: categoryTotals[catName],
            color: config.color,
            icon: config.icon
        };
    }).sort((a, b) => b.amount - a.amount); // Sort by highest expense

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ p: 1.5, boxShadow: 3, borderRadius: 2 }}>
                    <Typography fontWeight="bold" variant="body2">{label}</Typography>
                    <Typography color="error" fontWeight="bold">
                        {payload[0].value.toLocaleString()}đ
                    </Typography>
                </Paper>
            );
        }
        return null;
    };

    return (
        <Box sx={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 4, pb: 2, display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center' }}>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ position: 'absolute', left: 24, width: 44, height: 44, bgcolor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 3, '&:hover': { bgcolor: '#F0F0F0' } }}>
                    <MenuIcon sx={{ color: '#555' }} />
                </IconButton>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#333' }}>Thống kê</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* Date Filter */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <ToggleButtonGroup
                        color="primary"
                        value={filterType}
                        exclusive
                        onChange={handleFilterChange}
                        fullWidth
                        size="small"
                        sx={{ bgcolor: '#FFF', borderRadius: 2, '& .MuiToggleButton-root': { borderRadius: 2, fontWeight: 'bold', textTransform: 'none' } }}
                    >
                        <ToggleButton value="week">Tuần này</ToggleButton>
                        <ToggleButton value="month">Tháng này</ToggleButton>
                        <ToggleButton value="custom">Tùy chỉnh</ToggleButton>
                    </ToggleButtonGroup>

                    {filterType === 'custom' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField 
                                type="date" 
                                label="Từ ngày" 
                                size="small" 
                                fullWidth 
                                InputLabelProps={{ shrink: true }} 
                                value={startDate} 
                                onChange={e => setStartDate(e.target.value)} 
                                sx={{ bgcolor: '#FFF', borderRadius: 1 }}
                            />
                            <TextField 
                                type="date" 
                                label="Đến ngày" 
                                size="small" 
                                fullWidth 
                                InputLabelProps={{ shrink: true }} 
                                value={endDate} 
                                onChange={e => setEndDate(e.target.value)}
                                sx={{ bgcolor: '#FFF', borderRadius: 1 }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Summary Card */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#FFF', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Tổng chi tiêu</Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main" sx={{ mt: 0.5 }}>
                        {totalExpense.toLocaleString()}đ
                    </Typography>
                </Paper>

                {/* Chart */}
                <Box sx={{ height: 340, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} tickFormatter={(val) => formatCurrencyShort(val)} width={40} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color !== '#E2E3E5' ? entry.color : '#BDBDBD'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Category Breakdown */}
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>Chi tiết danh mục</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {chartData.map((data, index) => (
                        <Paper key={index} elevation={0} sx={{ p: 1, px: 1.5, borderRadius: 2, bgcolor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: data.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                                {data.icon}
                            </Box>
                            <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ flex: 1 }}>
                                {data.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="error.main">
                                {data.amount.toLocaleString()}đ
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </Box>

            <LeftMenuDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} user={user} setSettingsAnchorEl={() => {}} handleLogout={handleLogout} />
        </Box>
    );
}
