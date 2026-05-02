import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, Moon, Sun, Monitor, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must match'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const { user, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, email: user?.email },
  });

  const { register: regPass, handleSubmit: handlePassSubmit, formState: { errors: passErrors }, reset: resetPass } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', data);
      setAuth(res.data.data.user, localStorage.getItem('token'));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePassword = async (data) => {
    setLoading(true);
    try {
      await api.put('/auth/password', data);
      toast.success('Password changed successfully!');
      resetPass();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences and security.</p>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Profile</div>
        </div>
        <div className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Security</div>
        </div>
        <div className={`tab ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Moon size={18} /> Appearance</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit(onUpdateProfile)}>
            <div className="card-header" style={{ marginBottom: 32 }}>
              <h2 className="card-title">Profile Information</h2>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" {...regProfile('name')} />
                {profileErrors.name && <p className="form-error">{profileErrors.name.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" {...regProfile('email')} />
                {profileErrors.email && <p className="form-error">{profileErrors.email.message}</p>}
              </div>
            </div>
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePassSubmit(onUpdatePassword)}>
            <div className="card-header" style={{ marginBottom: 32 }}>
              <h2 className="card-title">Change Password</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" placeholder="••••••••" className="form-control" {...regPass('currentPassword')} />
              {passErrors.currentPassword && <p className="form-error">{passErrors.currentPassword.message}</p>}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" placeholder="••••••••" className="form-control" {...regPass('newPassword')} />
                {passErrors.newPassword && <p className="form-error">{passErrors.newPassword.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="form-control" {...regPass('confirmPassword')} />
                {passErrors.confirmPassword && <p className="form-error">{passErrors.confirmPassword.message}</p>}
              </div>
            </div>
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'appearance' && (
          <div>
            <div className="card-header" style={{ marginBottom: 32 }}>
              <h2 className="card-title">Theme Preference</h2>
            </div>
            <div className="grid-2" style={{ gap: 24 }}>
              <div 
                className={`card ${theme === 'light' ? 'active-theme' : ''}`} 
                onClick={() => setTheme('light')}
                style={{ 
                  cursor: 'pointer', 
                  padding: 24, 
                  textAlign: 'center', 
                  border: theme === 'light' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)',
                  background: theme === 'light' ? 'var(--clr-primary-subtle)' : 'var(--clr-surface)'
                }}
              >
                <Sun size={32} color={theme === 'light' ? 'var(--clr-primary)' : 'var(--clr-text-light)'} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 700, color: theme === 'light' ? 'var(--clr-primary)' : 'var(--clr-text)' }}>Light Mode</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>Standard Zoho experience</p>
              </div>

              <div 
                className={`card ${theme === 'dark' ? 'active-theme' : ''}`} 
                onClick={() => setTheme('dark')}
                style={{ 
                  cursor: 'pointer', 
                  padding: 24, 
                  textAlign: 'center', 
                  border: theme === 'dark' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)',
                  background: theme === 'dark' ? 'var(--clr-primary-subtle)' : 'var(--clr-surface)'
                }}
              >
                <Moon size={32} color={theme === 'dark' ? 'var(--clr-primary)' : 'var(--clr-text-light)'} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 700, color: theme === 'dark' ? 'var(--clr-primary)' : 'var(--clr-text)' }}>Dark Mode</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>Easier on the eyes at night</p>
              </div>
            </div>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--clr-bg)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
              <Monitor size={16} />
              <span>Theme changes are applied immediately to your workspace.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
