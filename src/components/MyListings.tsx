import React from 'react';
import type { Listing, Category } from '../types';

interface MyListingsProps {
  myListings: Listing[];
  categories: Category[];
  mySearchQuery: string;
  setMySearchQuery: (val: string) => void;
  myCategoryFilter: string;
  setMyCategoryFilter: (val: string) => void;
  myStatusFilter: string;
  setMyStatusFilter: (val: string) => void;
  showMyCategoryDropdown: boolean;
  setShowMyCategoryDropdown: (val: boolean) => void;
  showMyStatusDropdown: boolean;
  setShowMyStatusDropdown: (val: boolean) => void;
  openEditModal: (listing: Listing) => void;
  handleResolveBroken: (id: number) => void;
  handleReportBroken: (id: number) => void;
  handleDeleteListing: (id: number) => void;
}

export const MyListings: React.FC<MyListingsProps> = ({
  myListings,
  categories,
  mySearchQuery,
  setMySearchQuery,
  myCategoryFilter,
  setMyCategoryFilter,
  myStatusFilter,
  setMyStatusFilter,
  showMyCategoryDropdown,
  setShowMyCategoryDropdown,
  showMyStatusDropdown,
  setShowMyStatusDropdown,
  openEditModal,
  handleResolveBroken,
  handleReportBroken,
  handleDeleteListing,
}) => {
  const filtered = myListings.filter(item => {
    if (mySearchQuery.trim()) {
      const q = mySearchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (myCategoryFilter) {
      if (item.categoryId !== parseInt(myCategoryFilter, 10)) return false;
    }
    if (myStatusFilter !== 'all') {
      const isUnderRepair = !!(item.brokenUntil && new Date(item.brokenUntil) > new Date());
      if (myStatusFilter === 'repair' && !isUnderRepair) return false;
      if (myStatusFilter === 'active' && isUnderRepair) return false;
    }
    return true;
  });

  const filterBar = (
    <div className="rozetka-filter-bar">
      <div style={{ flex: '2', minWidth: '200px' }}>
        <input 
          type="text" 
          placeholder="Пошук за назвою або описом..." 
          value={mySearchQuery} 
          onChange={(e) => setMySearchQuery(e.target.value)}
          className="rozetka-filter-input"
        />
      </div>
      <div 
        className="rozetka-filter-segment" 
        style={{ flex: '1', minWidth: '150px', position: 'relative', cursor: 'pointer' }}
        onClick={() => setShowMyCategoryDropdown(!showMyCategoryDropdown)}
      >
        <div 
          className="rozetka-filter-input"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderColor: showMyCategoryDropdown ? '#00a046' : '#d2d2d2',
            boxShadow: showMyCategoryDropdown ? '0 0 0 1px #00a046' : 'none'
          }}
        >
          <span>
            {myCategoryFilter ? (categories.find(c => String(c.id) === String(myCategoryFilter))?.name || 'Всі категорії') : 'Всі категорії'}
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
              transform: showMyCategoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {showMyCategoryDropdown && (
          <ul 
            className="rozetka-custom-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderRadius: '4px',
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
            <li 
              onClick={() => {
                setMyCategoryFilter('');
                setShowMyCategoryDropdown(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: myCategoryFilter === '' ? '#f5f5f5' : 'transparent',
                fontWeight: myCategoryFilter === '' ? 600 : 500,
                fontSize: '13px',
                color: myCategoryFilter === '' ? '#00a046' : '#221f1f',
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={(e) => { if (myCategoryFilter !== '') e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { if (myCategoryFilter !== '') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Всі категорії
            </li>
            {categories.map((cat) => {
              const isSelected = String(myCategoryFilter) === String(cat.id);
              return (
                <li 
                  key={cat.id}
                  onClick={() => {
                    setMyCategoryFilter(String(cat.id));
                    setShowMyCategoryDropdown(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '13px',
                    color: isSelected ? '#00a046' : '#221f1f',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {cat.name}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div 
        className="rozetka-filter-segment" 
        style={{ flex: '1', minWidth: '150px', position: 'relative', cursor: 'pointer' }}
        onClick={() => setShowMyStatusDropdown(!showMyStatusDropdown)}
      >
        <div 
          className="rozetka-filter-input"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderColor: showMyStatusDropdown ? '#00a046' : '#d2d2d2',
            boxShadow: showMyStatusDropdown ? '0 0 0 1px #00a046' : 'none'
          }}
        >
          <span>
            {myStatusFilter === 'all' && 'Будь-який статус'}
            {myStatusFilter === 'active' && 'Справний (Активний)'}
            {myStatusFilter === 'repair' && 'На ремонті'}
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
              transform: showMyStatusDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {showMyStatusDropdown && (
          <ul 
            className="rozetka-custom-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #d2d2d2',
              marginTop: '4px',
              padding: '4px 0',
              listStyle: 'none',
              zIndex: 1030,
              maxHeight: '200px',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { value: 'all', label: 'Будь-який статус' },
              { value: 'active', label: 'Справний (Активний)' },
              { value: 'repair', label: 'На ремонті' }
            ].map((status) => {
              const isSelected = myStatusFilter === status.value;
              return (
                <li 
                  key={status.value}
                  onClick={() => {
                    setMyStatusFilter(status.value);
                    setShowMyStatusDropdown(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '13px',
                    color: isSelected ? '#00a046' : '#221f1f',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {status.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h2>Мої оголошення</h2>

      {myListings.length === 0 ? (
        <p style={{ margin: '30px 0', color: '#666' }}>
          Ви ще не додали жодного оголошення. Скористайтеся кнопкою «Здати річ в оренду».
        </p>
      ) : (
        <>
          {filterBar}
          {filtered.length === 0 ? (
            <p style={{ margin: '30px 0', color: '#666', textAlign: 'center' }}>
              Нічого не знайдено за вибраними фільтрами.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Оголошення</th>
                    <th>Категорія</th>
                    <th>Ціна за добу</th>
                    <th>Застава</th>
                    <th>Дата додавання</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const dateStr = new Date(item.createdAt || '').toLocaleDateString('uk-UA');
                    const isUnderRepair = !!(item.brokenUntil && new Date(item.brokenUntil) > new Date());
                    return (
                      <tr key={item.id}>
                        <td>
                          <a 
                            href={`/?listing=${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontWeight: 700, 
                              color: 'var(--primary-color)', 
                              textDecoration: 'none' 
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {item.title}
                          </a>
                          {isUnderRepair && (
                            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '12px', marginLeft: '6px' }}>
                              (На ремонті до {new Date(item.brokenUntil!).toLocaleDateString('uk-UA')})
                            </span>
                          )}
                          <br />
                          <span className="text-muted">Локація: {item.location}</span>
                        </td>
                        <td>{item.category?.name || 'Інше'}</td>
                        <td><strong>{item.price} грн</strong></td>
                        <td>{item.deposit} грн</td>
                        <td>{dateStr}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => {
                                window.open(`/?listing=${item.id}`, '_blank');
                              }}
                              title="Переглянути"
                              className="rozetka-action-btn btn-view"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openEditModal(item)}
                              title="Редагувати"
                              className="rozetka-action-btn btn-edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                              </svg>
                            </button>
                            {isUnderRepair ? (
                              <>
                                <button 
                                  onClick={() => handleResolveBroken(item.id)}
                                  title="Полагодити"
                                  className="rozetka-action-btn btn-fix"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleReportBroken(item.id)}
                                  title="Продовжити ремонт"
                                  className="rozetka-action-btn btn-extend"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleReportBroken(item.id)}
                                title="Повідомити про поломку"
                                className="rozetka-action-btn btn-broken"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                  <line x1="12" y1="9" x2="12" y2="13"/>
                                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteListing(item.id)}
                              title="Видалити"
                              className="rozetka-action-btn btn-delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
