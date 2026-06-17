import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#f7f7f7',
      padding: '48px 24px 24px 24px',
      marginTop: 'auto',
      borderTop: '1px solid #ebebeb',
      fontSize: '14px',
      color: '#222222',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '32px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Column 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#222222', letterSpacing: '-0.8px' }}>RentLocal</h4>
          <span style={{ color: '#717171', fontSize: '14px' }}>для оренди речей</span>
        </div>

        {/* Column 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#222222' }}>Про нас</h4>
          <a 
            href="#how-it-works" 
            style={{ color: '#222222', textDecoration: 'none', fontSize: '14px', transition: 'text-decoration 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Як працює?
          </a>
        </div>

        {/* Column 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#222222' }}>Підтримка</h4>
          <a 
            href="mailto:Bodnar.anastasiia.2007@gmail.com" 
            style={{ color: '#222222', textDecoration: 'none', fontSize: '14px', transition: 'text-decoration 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Bodnar.anastasiia.2007@gmail.com
          </a>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #ebebeb',
        paddingTop: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        fontSize: '13px',
        color: '#222222'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>© 2026 RentLocal</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '16px', width: '16px', fill: 'currentColor' }}>
              <path d="m8.002.25a7.77 7.77 0 0 1 7.748 7.776 7.75 7.75 0 0 1 -7.521 7.72l-.246.004a7.75 7.75 0 0 1 -7.73-7.502l-.018-.274a7.75 7.75 0 0 1 7.747-7.724zm0 1.5a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5zm0 1a4.93 4.93 0 0 1 1.75 3.75h-3.5a4.93 4.93 0 0 1 1.75-3.75zm1.75 5.25h-3.5a4.93 4.93 0 0 1 1.75 3.75 4.93 4.93 0 0 1 -1.75-3.75zm3.72-1.5c-.29-1.57-.96-2.95-1.92-3.93a6.2 6.2 0 0 1 1.92 3.93zm-9.04 0h-1.68a6.2 6.2 0 0 1 1.68-3.93 6.22 6.22 0 0 0 -1.68 3.93zm9.04 1.5a6.2 6.2 0 0 1 -1.92 3.93c.96-.98 1.63-2.36 1.92-3.93zm-9.04 0a6.22 6.22 0 0 0 1.68 3.93 6.2 6.2 0 0 1 -1.68-3.93z"></path>
            </svg>
            Українська (UA)
          </span>
          <span style={{ fontWeight: 600 }}>₴ UAH</span>
        </div>
      </div>
    </footer>
  );
};
