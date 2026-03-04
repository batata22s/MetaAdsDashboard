const DATE_OPTIONS = [
  { label: 'Hoje', value: 'today' },
  { label: '3 dias', value: 'last_3d' },
  { label: '7 dias', value: 'last_7d' },
  { label: '14 dias', value: 'last_14d' },
  { label: '28 dias', value: 'last_28d' },
  { label: '30 dias', value: 'last_30d' },
  { label: '90 dias', value: 'last_90d' },
];

function DateFilter({ selected, onChange }) {
  return (
    <div className="date-filter">
      {DATE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={selected === opt.value ? 'active' : ''}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default DateFilter;
