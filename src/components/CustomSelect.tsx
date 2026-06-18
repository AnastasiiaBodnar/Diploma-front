import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Оберіть значення',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div 
      ref={containerRef}
      id={id}
      className="rozetka-filter-segment" 
      style={{ 
        position: 'relative', 
        cursor: 'pointer', 
        width: '100%',
        userSelect: 'none'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderColor: isOpen ? '#00a046' : '#b0b0b0',
          boxShadow: isOpen ? '0 0 0 1px #00a046' : 'none',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px solid',
          height: '46px',
          backgroundColor: '#fff',
          boxSizing: 'border-box',
          fontSize: '14px',
          color: '#221f1f',
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          color: selectedOption ? '#221f1f' : '#717171'
        }}>
          {displayLabel}
        </span>
        <svg 
          viewBox="0 0 24 24" 
          width="14" 
          height="14" 
          fill="none" 
          stroke="#717171" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <ul 
          className="rozetka-custom-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #d2d2d2',
            marginTop: '4px',
            padding: '4px 0',
            listStyle: 'none',
            zIndex: 1030,
            maxHeight: '260px',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => {
            const isSelected = String(value) === String(opt.value);
            return (
              <li 
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '14px',
                  color: isSelected ? '#00a046' : '#221f1f',
                  transition: 'background-color 0.1s'
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
