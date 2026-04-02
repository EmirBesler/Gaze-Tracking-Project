import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReportPage = () => {
    // URL'deki ?username=... parametrelerini okumak için
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');
    const sessionId = searchParams.get('sessionId');

    // Admin'den gelip gelmediğimizi kontrol etmek için
    const location = useLocation();
    const navigate = useNavigate();
    
    // State'in içinde fromAdmin var mı? (Normal kullanıcıda bu null/undefined olur)
    const showBackButton = location.state?.fromAdmin; 

    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        if (username && sessionId) {
            // Rapor verilerini çek (Eski endpointin)
            axios.get(`http://localhost:8085/api/report/get?username=${username}&sessionId=${sessionId}`)
                .then(res => setReportData(res.data))
                .catch(err => console.error(err));
        }
    }, [username, sessionId]);

    return (
        <div style={styles.container}>
            
            {/* --- KRİTİK NOKTA: GERİ BUTONU --- */}
            {showBackButton && (
                <button 
                    onClick={() => navigate('/admin')} // Admin paneli yolun neyse buraya yaz
                    style={styles.backButton}
                >
                    ← Yönetici Paneline Dön
                </button>
            )}
            {/* ---------------------------------- */}

            <h1 style={styles.header}>Kullanıcı Raporu</h1>
            <p style={{color: '#aaa'}}>Kullanıcı: {username} | Oturum: {sessionId}</p>

            <div style={styles.content}>
                {reportData ? (
                    <div>
                        {/* Rapor içeriğini buraya basabilirsin */}
                        <h3>Duygu Analizi Sonuçları:</h3>
                        <pre style={styles.codeBlock}>
                            {JSON.stringify(reportData.emotion, null, 2)}
                        </pre>

                        <h3>Odaklanma (Grid) Sonuçları:</h3>
                        <pre style={styles.codeBlock}>
                            {JSON.stringify(reportData.grid, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <p>Veriler yükleniyor...</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' },
    header: { marginBottom: '10px' },
    backButton: {
        marginBottom: '20px',
        padding: '10px 20px',
        backgroundColor: '#333',
        color: '#fff',
        border: '1px solid #555',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    content: { marginTop: '30px', padding: '20px', backgroundColor: '#252525', borderRadius: '8px' },
    codeBlock: { backgroundColor: '#111', padding: '15px', borderRadius: '5px', overflowX: 'auto' }
};

export default ReportPage;