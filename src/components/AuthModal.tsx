import React, { useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { AuthMode } from '../types';

interface AuthModalProps {
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  handleAuthSubmit: (e: FormEvent) => void;
  handleGoogleCredentialResponse: (response: any) => void;
  loading: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isAuthOpen,
  setIsAuthOpen,
  authMode,
  setAuthMode,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  handleAuthSubmit,
  handleGoogleCredentialResponse,
  loading,
}) => {
  useEffect(() => {
    if (isAuthOpen && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: '1050001244321-9n1id40e9uafiie3p1jqtgqhom60idjd.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse,
      });
      setTimeout(() => {
        const btnContainer = document.getElementById('google-login-btn');
        if (btnContainer && (window as any).google) {
          (window as any).google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', width: '360' }
          );
        }
      }, 50);
    }
  }, [isAuthOpen, authMode, handleGoogleCredentialResponse]);

  if (!isAuthOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsAuthOpen(false)}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setIsAuthOpen(false)}>×</button>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            Вхід
          </button>
          <button 
            className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => setAuthMode('register')}
          >
            Реєстрація
          </button>
        </div>

        <form onSubmit={handleAuthSubmit}>
          {authMode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="firstName-input">Ім'я *</label>
                <input 
                  type="text" 
                  id="firstName-input"
                  required
                  value={firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  placeholder="Ваше ім'я..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName-input">Прізвище *</label>
                <input 
                  type="text" 
                  id="lastName-input"
                  required
                  value={lastName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                  placeholder="Ваше прізвище..."
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email-input">Електронна пошта *</label>
            <input 
              type="email" 
              id="email-input"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Пароль *</label>
            <input 
              type="password" 
              id="password-input"
              required
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Мін. 6 символів"
            />
          </div>

          <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Завантаження...' : (authMode === 'login' ? 'Увійти' : 'Зареєструватися')}
          </button>
        </form>

        <div style={{ margin: '15px 0', textAlign: 'center', color: '#666', fontSize: '14px' }}>або</div>
        <div id="google-login-btn" style={{ display: 'flex', justifyContent: 'center' }}></div>
      </div>
    </div>
  );
};
