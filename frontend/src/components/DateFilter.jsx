import { useState, useRef, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';

const DATE_OPTIONS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: '7 dias', value: 'last_7d' },
  { label: '15 dias', value: 'last_15d' },
  { label: '30 dias', value: 'last_30d' },
];

function DateFilter({ selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverRef]);

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange({ preset: 'custom', since: customStart, until: customEnd });
      setIsOpen(false);
    }
  };

  const isCustom = typeof selected === 'object' && selected?.preset === 'custom';
  const displaySelected = isCustom ? 'custom' : selected;

  return (
    <div className="date-filter" style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 100 }}>
      {DATE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={displaySelected === opt.value ? 'active' : ''}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}

      <button
        className={isCustom ? 'active' : ''}
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <FiCalendar />
        {isCustom ? `${customStart.split('-').reverse().join('/')} - ${customEnd.split('-').reverse().join('/')}` : 'Personalizado'}
      </button>

      {isOpen && (
        <div ref={popoverRef} style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '16px', zIndex: 1000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '280px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f8fafc' }}>Período Personalizado</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Data Inicial</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Data Final</label>
              <input
                type="date"
                value={customEnd}
                min={customStart}
                onChange={e => setCustomEnd(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!customStart || !customEnd}
            style={{
              width: '100%', padding: '8px', borderRadius: '6px', border: 'none',
              background: (!customStart || !customEnd) ? '#334155' : '#22c55e',
              color: (!customStart || !customEnd) ? '#94a3b8' : '#0f172a',
              fontWeight: '600', cursor: (!customStart || !customEnd) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Aplicar Filtro
          </button>
        </div>
      )}
    </div>
  );
}

export default DateFilter;
