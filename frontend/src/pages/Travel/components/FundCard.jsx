import { FUND_COLORS, STATUS_CONFIG, formatVND, formatDate } from '../travelConfig';

export default function FundCard({ fund, onClick }) {
    const theme = FUND_COLORS.find(c => c.color === fund.color) || FUND_COLORS[0];
    const status = STATUS_CONFIG[fund.status] || STATUS_CONFIG.planning;
    const actualBudget = (fund.budget || 0) + (fund.total_income || 0);
    const pct = actualBudget > 0 ? Math.min(100, Math.round(fund.total_spent / actualBudget * 100)) : 0;
    const remaining = actualBudget > 0 ? actualBudget - fund.total_spent : null;

    const daysLeft = (() => {
        if (!fund.end_date) return null;
        const diff = Math.ceil((new Date(fund.end_date) - new Date()) / 86400000);
        return diff;
    })();

    return (
        <div onClick={onClick} style={{
            borderRadius: 20,
            background: theme.gradient,
            padding: '20px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${fund.color}44`,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            userSelect: 'none',
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Decorative circle */}
            <div style={{
                position: 'absolute', right: -30, top: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)'
            }} />
            <div style={{
                position: 'absolute', right: 20, bottom: -40,
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)'
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 32, lineHeight: 1 }}>{fund.cover_emoji}</span>
                    <div>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{fund.name}</div>
                        {fund.destination && (
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                                📍 {fund.destination}
                            </div>
                        )}
                    </div>
                </div>
                <span style={{
                    background: status.bg,
                    color: status.color,
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 9px', borderRadius: 20,
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(255,255,255,0.22)',
                    color: 'white',
                }}>
                    {status.label}
                </span>
            </div>

            {/* Dates */}
            {(fund.start_date || fund.end_date) && (
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span>🗓</span>
                    <span>
                        {formatDate(fund.start_date)} {fund.end_date ? `→ ${formatDate(fund.end_date)}` : ''}
                    </span>
                    {daysLeft !== null && daysLeft >= 0 && (
                        <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>
                            {daysLeft === 0 ? 'Hôm nay!' : `${daysLeft} ngày`}
                        </span>
                    )}
                </div>
            )}

            {/* Budget progress */}
            {actualBudget > 0 && (
                <div 
                    onClick={(e) => {
                        if (onContributeClick) {
                            e.stopPropagation();
                            onContributeClick(e, fund);
                        }
                    }}
                    style={{ marginBottom: 10, padding: '8px', margin: '-8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 6 }}>
                        <span>Đã chi: <b style={{ color: 'white' }}>{formatVND(fund.total_spent)}</b></span>
                        <span>Quỹ: <b style={{ color: 'white' }}>{formatVND(actualBudget)}</b></span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: 99,
                            background: pct >= 90 ? '#fbbf24' : 'white',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4, textAlign: 'right' }}>
                        {pct}% • còn lại: {formatVND(Math.max(0, remaining))}
                    </div>
                </div>
            )}

            {/* No budget */}
            {actualBudget === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 }}>
                    💸 Tổng chi: <b style={{ color: 'white' }}>{formatVND(fund.total_spent)}</b>
                </div>
            )}
        </div>
    );
}
