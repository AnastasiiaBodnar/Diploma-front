import React from 'react';
import type { Category } from '../types';
import { getCategorySvgIcon } from '../utils/helpers';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (slug: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div 
      className="categories-bar-wrapper" 
      style={{
        borderBottom: '1px solid #ebebeb',
        backgroundColor: '#ffffff',
        width: '100%',
        marginBottom: '24px'
      }}
    >
      <div 
        className="categories-bar" 
        style={{
          display: 'flex',
          gap: '24px',
          padding: '12px 24px 8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%'
        }}
      >
      {/* Категорія "Усі" */}
      <button 
        onClick={() => setSelectedCategory('')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          padding: '4px 0 10px',
          cursor: 'pointer',
          color: selectedCategory === '' ? '#10B981' : '#717171',
          borderBottom: selectedCategory === '' ? '2px solid #10B981' : '2px solid transparent',
          minWidth: '64px',
          transition: 'color 0.2s, border-bottom-color 0.2s',
          borderRadius: 0
        }}
      >
        <div className="category-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>Усі речі</span>
      </button>

      {categories.map(c => {
        const isSelected = selectedCategory === c.slug;
        return (
          <button 
            key={c.id}
            onClick={() => setSelectedCategory(c.slug)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              padding: '4px 0 10px',
              cursor: 'pointer',
              color: isSelected ? '#10B981' : '#717171',
              borderBottom: isSelected ? '2px solid #10B981' : '2px solid transparent',
              minWidth: '64px',
              transition: 'color 0.2s, border-bottom-color 0.2s',
              borderRadius: 0
            }}
          >
            <div className="category-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getCategorySvgIcon(c.slug)}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.name}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
};
