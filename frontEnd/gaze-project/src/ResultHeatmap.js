import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Pasta Grafik Renkleri
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

const ResultHeatmap = ({ username, sessionId, onRestart }) => {
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        if (username && sessionId) {
            axios.get(`http://localhost:8085/api/report/get?username=${username}&sessionId=${sessionId}`)
                .then(res => setReportData(res.data))
                .catch(err => console.error(err));
        }
    }, [username, sessionId]);

    // Veriyi Recharts formatına çeviren yardımcı fonksiyon
    const prepareChartData = (dataObj) => {
        if (!dataObj) return [];
        return Object.keys(dataObj).map(key => ({
            name: key,
            value: parseFloat(dataObj[key].toFixed(1)) // Virgülden sonra 1 basamak
        }));
    };

    // Grid verisine göre kutu rengini hesapla (Opaklık değeri yüzdeliğe göre artar)
    const getGridColor = (gridId) => {
        if (!reportData || !reportData.grid) return 'rgba(255, 255, 255, 0.1)';
        const value = reportData.grid[gridId.toString()] || 0;
        // Değer ne kadar yüksekse kırmızı o kadar koyu olur
        const intensity = Math.min(value / 50, 1); // 50% ve üzeri tam kırmızı olsun
        return `rgba(255, 0, 0, ${intensity})`; 
    };

    const getGridValue = (gridId) => {
        if (!reportData || !reportData.grid) return 0;
        return reportData.grid[gridId.toString()] ? reportData.grid[gridId.toString()].toFixed(1) : 0;
    };

    return (
        <div style={styles.container}>
            {/* Üst Bar */}
            <div style={styles.headerRow}>
                <div>
                    <h2 style={{ margin: 0 }}>Analiz Raporu</h2>
                    <small style={{ color: '#aaa' }}>{username} - {sessionId}</small>
                </div>
                <button onClick={onRestart} style={styles.backButton}>
                    ← Geri / Yeni Test
                </button>
            </div>

            {reportData ? (
                <div style={styles.dashboard}>
                    
                    {/* SOL TARAF: DUYGU GRAFİĞİ */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Duygu Durumu (%)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={prepareChartData(reportData.emotion)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {prepareChartData(reportData.emotion).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* SAĞ TARAF: ODAK ISI HARİTASI (3x3 GRID) */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Odak Isı Haritası (Hangi bölgeye bakıldı?)</h3>
                        <div style={styles.gridContainer}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => (
                                <div 
                                    key={id} 
                                    style={{
                                        ...styles.gridItem,
                                        backgroundColor: getGridColor(id),
                                        border: `1px solid ${getGridValue(id) > 0 ? '#ff4d4d' : '#333'}`
                                    }}
                                >
                                    <span style={styles.gridLabel}>Bölge {id}</span>
                                    <span style={styles.gridValue}>%{getGridValue(id)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            ) : (
                <div style={styles.loading}>Veriler Analiz Ediliyor...</div>
            )}
        </div>
    );
};

// CSS Stilleri
const styles = {
    container: { width: '100%', height: '100%', backgroundColor: '#121212', color: 'white', padding: '20px', boxSizing: 'border-box', overflowY: 'auto' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' },
    backButton: { padding: '10px 20px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '5px', cursor: 'pointer' },
    
    dashboard: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    card: { flex: 1, minWidth: '300px', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
    cardTitle: { borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0 },
    
    // 3x3 Grid Stili
    gridContainer: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '5px', 
        height: '300px',
        marginTop: '20px'
    },
    gridItem: { 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: '5px',
        transition: 'all 0.3s ease'
    },
    gridLabel: { fontSize: '12px', color: '#ddd', marginBottom: '5px' },
    gridValue: { fontSize: '18px', fontWeight: 'bold', textShadow: '0 1px 2px black' },

    loading: { textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#888' }
};

export default ResultHeatmap;