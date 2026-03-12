import React, { useState, useMemo, useEffect } from 'react';
import { FiX, FiSearch, FiCheckSquare, FiSquare, FiSave } from 'react-icons/fi';
import { AVAILABLE_METRICS, METRIC_CATEGORIES } from '../utils/metricsDefinitions';

const MetricsModal = ({ isOpen, onClose, selectedMetrics, onSave }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [draftSelection, setDraftSelection] = useState(selectedMetrics || []);

    // Atualizar rascunho toda vez que o modal for aberto
    useEffect(() => {
        if (isOpen) {
            setDraftSelection(selectedMetrics || []);
            setSearchTerm('');
        }
    }, [isOpen, selectedMetrics]);

    // Filtrar métricas com base no usuário
    const filteredMetrics = useMemo(() => {
        if (!searchTerm) return AVAILABLE_METRICS;
        return AVAILABLE_METRICS.filter(m =>
            m.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Agrupar métricas por categoria p renderização
    const metricsByCategory = useMemo(() => {
        const grouped = {};
        Object.values(METRIC_CATEGORIES).forEach(cat => {
            grouped[cat] = filteredMetrics.filter(m => m.category === cat);
        });
        return grouped;
    }, [filteredMetrics]);

    if (!isOpen) return null;

    const handleToggle = (id) => {
        setDraftSelection(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleSelectCategory = (category, selectAll) => {
        const categoryIds = AVAILABLE_METRICS.filter(m => m.category === category).map(m => m.id);

        if (selectAll) {
            setDraftSelection(prev => {
                const newSelection = [...prev];
                categoryIds.forEach(id => {
                    if (!newSelection.includes(id)) newSelection.push(id);
                });
                return newSelection;
            });
        } else {
            setDraftSelection(prev => prev.filter(id => !categoryIds.includes(id)));
        }
    };

    const isCategoryFullySelected = (category) => {
        const categoryIds = AVAILABLE_METRICS.filter(m => m.category === category).map(m => m.id);
        if (categoryIds.length === 0) return false;
        return categoryIds.every(id => draftSelection.includes(id));
    };

    const handleSelectAllGlobally = (select) => {
        if (select) {
            setDraftSelection(AVAILABLE_METRICS.map(m => m.id));
        } else {
            setDraftSelection([]);
        }
    };

    const allGloballySelected = draftSelection.length === AVAILABLE_METRICS.length && AVAILABLE_METRICS.length > 0;

    const handleSaveClick = () => {
        onSave(draftSelection);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="modal-content" style={{
                background: '#1e293b',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Header */}
                <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Configurar Cards de Métricas</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{draftSelection.length} selecionados</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px', padding: 8, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiX />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: 18 }} />
                        <input
                            type="text"
                            placeholder="Buscar métrica..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                borderRadius: '8px',
                                border: '2px solid #22c55e',
                                background: '#0f172a',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Global Actions */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <button onClick={() => handleSelectAllGlobally(true)} style={{ background: 'none', border: 'none', color: allGloballySelected ? '#22c55e' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Selecionar Tudo</button>
                        <button onClick={() => handleSelectAllGlobally(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Limpar Seleção</button>
                    </div>

                    {/* Categories */}
                    {Object.values(METRIC_CATEGORIES).map(category => {
                        const metrics = metricsByCategory[category];
                        if (!metrics || metrics.length === 0) return null;

                        const isFullySelected = isCategoryFullySelected(category);

                        return (
                            <div key={category} style={{ marginBottom: '28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#34d399', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</h3>
                                    <button
                                        onClick={() => handleSelectCategory(category, !isFullySelected)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        {isFullySelected ? 'Desmarcar Tudo' : 'Marcar Tudo'}
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {metrics.map(metric => {
                                        const isSelected = draftSelection.includes(metric.id);
                                        return (
                                            <div
                                                key={metric.id}
                                                onClick={() => handleToggle(metric.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    cursor: 'pointer',
                                                    padding: '6px 4px',
                                                    borderRadius: '6px',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <div style={{ color: isSelected ? '#22c55e' : 'var(--text-muted)', display: 'flex', alignItems: 'center', fontSize: '18px' }}>
                                                    {isSelected ? <FiCheckSquare fill="#22c55e" color="#0f172a" /> : <FiSquare />}
                                                </div>
                                                <span style={{ color: isSelected ? '#fff' : 'var(--text-muted)', fontSize: '14px', fontWeight: isSelected ? '500' : '400', userSelect: 'none' }}>
                                                    {metric.label}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {filteredMetrics.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                            Nenhuma métrica encontrada para "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                    <button onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                        Cancelar
                    </button>
                    <button onClick={handleSaveClick} style={{ padding: '10px 24px', background: '#22c55e', border: 'none', color: '#0f172a', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)', transition: 'all 0.2s' }}>
                        <FiSave /> Salvar {draftSelection.length} Métricas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetricsModal;
