import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TRAVEL_CATEGORIES, formatFullVND } from '../travelConfig';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 2, boxShadow: 3, border: '1px solid #f0f0f0' }}>
            <Typography fontWeight={700} fontSize={13}>{d.icon} {d.name}</Typography>
            <Typography fontSize={13} color="text.secondary">{formatFullVND(d.value)}</Typography>
            <Typography fontSize={12} color="text.secondary">{d.percentage}%</Typography>
        </Box>
    );
};

export default function CategorySummary({ summary }) {
    if (!summary?.by_category?.length) {
        return (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <Typography fontSize={40}>📊</Typography>
                <Typography>Chưa có chi tiêu nào</Typography>
            </Box>
        );
    }

    const chartData = summary.by_category.map(s => {
        const cat = TRAVEL_CATEGORIES[s.category] || TRAVEL_CATEGORIES['khác'];
        return {
            name: cat.label,
            value: s.total,
            color: cat.color,
            icon: cat.icon,
            percentage: s.percentage,
            count: s.count,
        };
    });

    return (
        <Box>
            {/* Donut chart */}
            <Box sx={{ height: 220, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            {/* Total */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>TỔNG CHI TIÊU</Typography>
                <Typography fontWeight={900} fontSize={22} sx={{ color: '#1c1917' }}>
                    {formatFullVND(summary.grand_total)}
                </Typography>
            </Box>

            {/* Category breakdown */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {chartData.map((d, i) => (
                    <Box key={i} sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        p: 1.5, borderRadius: 2.5, bgcolor: 'white',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: 2,
                            bgcolor: d.color + '15',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, flexShrink: 0
                        }}>
                            {d.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography fontWeight={700} fontSize={13}>{d.name}</Typography>
                                <Typography fontWeight={800} fontSize={13} sx={{ color: d.color }}>
                                    {formatFullVND(d.value)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ flex: 1, height: 5, borderRadius: 99, bgcolor: '#f0f0f0', overflow: 'hidden' }}>
                                    <Box sx={{ height: '100%', width: `${d.percentage}%`, bgcolor: d.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30, textAlign: 'right' }}>
                                    {d.percentage}%
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">{d.count} khoản</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
