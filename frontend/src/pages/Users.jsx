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
    // Fetch all users via the dashboard stats (admin only page)
    // We'll implement a /api/users endpoint in the backend for this
    api.get('/users').then((r) => setUsers(r.data.data.users)).catch(() => {
      // Fallback: show current user info
      setUsers([user].filter(Boolean));
    }).finally(() => setLoading(false));
  }, []);

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success('User ID copied!');
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">All registered users in your workspace</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: '0.82rem', color: 'var(--clr-primary-glow)' }}>
          <Shield size={14} /> Admin Only View
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
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>User ID</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                          {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>{u.role}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', background: 'var(--clr-surface-2)', padding: '2px 8px', borderRadius: 4 }}>
                          {u.id?.slice(0, 8)}…
                        </code>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => copyId(u.id)} title="Copy full ID" id={`btn-copy-${u.id}`}>
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="text-muted text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
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
