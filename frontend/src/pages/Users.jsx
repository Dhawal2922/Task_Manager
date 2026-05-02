import { useEffect, useState } from 'react';
import { Users, Shield, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data.data.users)).catch(() => {
      setUsers([user].filter(Boolean));
    }).finally(() => setLoading(false));
  }, []);

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success('User ID copied!');
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">Manage system users and their workspace permissions.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--clr-primary-subtle)', color: 'var(--clr-primary)', padding: '10px 20px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, border: '1px solid rgba(0,103,255,0.1)' }}>
          <Shield size={16} /> Admin Managed View
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--clr-primary)' }} /></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User Information</th>
                  <th>Workspace Role</th>
                  <th>System Identity</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="avatar" style={{ width: 42, height: 42, borderRadius: 10, background: u.role === 'Admin' ? 'var(--clr-primary)' : 'var(--clr-text-light)', fontSize: '0.9rem' }}>
                          {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--clr-text)', fontSize: '0.95rem' }}>{u.name}</div>
                          <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-member'}`} style={{ 
                        padding: '4px 14px', 
                        fontSize: '0.75rem', 
                        background: u.role === 'Admin' ? 'rgba(0,103,255,0.1)' : 'var(--clr-bg)',
                        color: u.role === 'Admin' ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
                        border: '1px solid ' + (u.role === 'Admin' ? 'rgba(0,103,255,0.2)' : 'var(--clr-border)')
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <code style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.75rem', 
                          color: 'var(--clr-text-muted)', 
                          background: 'var(--clr-surface-2)', 
                          padding: '6px 12px', 
                          borderRadius: 6,
                          border: '1px solid var(--clr-border)'
                        }}>
                          {u.id?.slice(0, 12)}...
                        </code>
                        <button className="btn btn-ghost btn-sm" onClick={() => copyId(u.id)} style={{ padding: 6, opacity: 0.6 }}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-text)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                        <span style={{ fontSize: '0.725rem', color: 'var(--clr-text-light)' }}>Registration Date</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
