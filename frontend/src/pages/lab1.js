import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Lab1 = () => {
    const navigate = useNavigate();

    const [params, setParams] = useState({ m: '', a: '', c: '', x0: '' });
    const [count, setCount] = useState('');
    const [results, setResults] = useState(null);
    const [hoveredBtn, setHoveredBtn] = useState(null);

    const handleAction = async (endpoint) => {
        if (!count) {
            alert("Будь ласка, введіть кількість!");
            return;
        }

        const m = params.m ? Number(params.m) : 67108863;
        const a = params.a ? Number(params.a) : 2197;
        const c = params.c ? Number(params.c) : 1597;
        const x0 = params.x0 ? Number(params.x0) : 13;

        const payload = { count: Number(count), params: { m, a, c, x0 } };

        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/v1/lab1/${endpoint}`, payload);
            setResults(response.data);
        } catch (error) {
            alert("Помилка виконання.");
        }
    };

    const getBtnStyle = (id) => ({
        width: '100%',
        padding: '14px',
        fontSize: '15px',
        backgroundColor: '#3d5690',
        color: hoveredBtn === id ? '#eaf3b2' : '#ffffff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: 'bold'
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f7f9', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            <header style={{ width: '100%', backgroundColor: '#3d5690', padding: '15px 0', textAlign: 'center', color: '#ffffff', position: 'relative' }}>
                <button onClick={() => navigate('/')} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '5px', padding: '5px 12px', cursor: 'pointer' }}>← Назад</button>
                <h1 style={{ margin: 0, fontSize: '20px' }}>LCG Generator Control Panel</h1>
            </header>

            <div style={{ padding: '30px 20px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                    <h2 style={{ color: '#3d5690', marginTop: 0, marginBottom: '20px', fontSize: '18px', borderLeft: '4px solid #3d5690', paddingLeft: '12px' }}>Parameters:</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        {['m', 'a', 'c', 'x0'].map(p => (
                            <div key={p}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#555', fontSize: '12px' }}>{p}</label>
                                <input
                                    type="number"
                                    value={params[p]}
                                    onChange={(e) => setParams({...params, [p]: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed', outline: 'none', boxSizing: 'border-box' }}
                                    placeholder="Variant #17"
                                />
                                <div style={{ fontSize: '10px', color: '#9aaabb', marginTop: '5px' }}>default: {p === 'm' ? '67108863' : p === 'a' ? '2197' : p === 'c' ? '1597' : '13'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'stretch' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ color: '#3d5690', marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Generation settings:</h3>
                        <div style={{ flexGrow: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#3d5690', fontWeight: 'bold', marginBottom: '8px' }}>Кількість чисел(обов'язково):</label>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(e.target.value)}
                                placeholder="Введіть число..."
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #e1e8ed', boxSizing: 'border-box', marginBottom: '20px' }}
                            />
                        </div>
                        <button onMouseEnter={() => setHoveredBtn('gen')} onMouseLeave={() => setHoveredBtn(null)} onClick={() => handleAction('generate')} style={getBtnStyle('gen')}>Generate sequence</button>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ color: '#3d5690', marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Statistical analysis:</h3>
                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onMouseEnter={() => setHoveredBtn('per')} onMouseLeave={() => setHoveredBtn(null)} onClick={() => handleAction('period')} style={getBtnStyle('per')}>Check period</button>
                            <button onMouseEnter={() => setHoveredBtn('ces')} onMouseLeave={() => setHoveredBtn(null)} onClick={() => handleAction('cesaro')} style={getBtnStyle('ces')}>Run cesaro test</button>
                        </div>
                    </div>
                </div>

                {results && (
                    <div style={{ marginTop: '30px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderLeft: '10px solid #3d5690' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ color: '#3d5690', margin: 0, fontSize: '20px' }}>Execution results:</h2>
                            <button onClick={() => setResults(null)} style={{ background: '#fdf2f2', border: '1px solid #f8d7da', color: '#d9534f', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Clear</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {results.sequence && (
                                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                                    <span style={{ display: 'block', fontWeight: 'bold', color: '#3d5690', marginBottom: '10px', fontSize: '14px' }}>Generated sequence:</span>
                                    <code style={{ wordBreak: 'break-all', color: '#444', fontSize: '15px', lineHeight: '1.8' }}>
                                        {results.sequence.join(', ')}
                                    </code>
                                </div>
                            )}

                            {results.period !== undefined && (
                                <div style={{ padding: '20px', backgroundColor: '#eef2f7', borderRadius: '12px', textAlign: 'center', border: '1px solid #d1d9e6' }}>
                                    <span style={{ display: 'block', fontSize: '12px', color: '#6c757d', fontWeight: 'bold', marginBottom: '5px' }}>Calculated period length:</span>
                                    <b style={{ fontSize: '28px', color: '#3d5690' }}>{results.period}</b>
                                </div>
                            )}

                            {results.pi_estimate !== undefined && (
                                <div style={{ padding: '25px', backgroundColor: '#fff9e6', borderRadius: '15px', border: '1px solid #ffeeba' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '11px', color: '#856404', fontWeight: 'bold', marginBottom: '8px' }}>Pi estimation:</span>
                                            <b style={{ fontSize: '26px', color: '#856404', fontFamily: 'monospace' }}>{results.pi_estimate.toFixed(7)}</b>
                                        </div>
                                        <div style={{ width: '2px', height: '50px', backgroundColor: '#ffeeba' }}></div>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '11px', color: '#856404', fontWeight: 'bold', marginBottom: '8px' }}>Absolute deviation:</span>
                                            <b style={{ fontSize: '26px', color: '#d9534f', fontFamily: 'monospace' }}>{results.deviation.toFixed(7)}</b>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: '#998d6d' }}>Based on {results.pairs} random pairs</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lab1;