import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, Clock, AlertCircle, Layers, Calendar, TrendingUp } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const STATUS_COLORS = {
  'Todo': 'var(--clr-text-muted)',
  'In-Progress': '#fbbf24',
  'Done': '#10b981',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.get('/dashboard/stats').then((r) => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderTopColor: 'var(--clr-primary)' }} />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const { taskCounts, overdueTasks, upcomingDeadlines, projectSummary } = stats || {};

  const chartData = [
    { name: 'Todo', value: taskCounts?.Todo || 0 },
    { name: 'In Progress', value: taskCounts?.['In-Progress'] || 0 },
    { name: 'Done', value: taskCounts?.Done || 0 },
  ];

  const completionPct = taskCounts?.total
    ? Math.round((taskCounts.Done / taskCounts.total) * 100)
    : 0;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your workspace at a glance — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* ─── Stat Cards ────────────────── */}
      <div className="stats-grid">
        {user?.role === 'Admin' && (
          <>
            <div className="stat-card" style={{ '--card-accent': 'var(--clr-primary)', '--card-glow': 'linear-gradient(135deg, rgba(99,102,241,0.08), transparent)' }}>
              <div className="stat-icon" style={{ background: 'var(--clr-primary-subtle)' }}>
                <Layers size={22} color="var(--clr-primary-glow)" />
              </div>
              <div>
                <div className="stat-number">{projectSummary?.totalProjects ?? '—'}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>
            <div className="stat-card" style={{ '--card-accent': 'var(--clr-accent)', '--card-glow': 'linear-gradient(135deg, rgba(6,182,212,0.08), transparent)' }}>
              <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.1)' }}>
                <TrendingUp size={22} color="var(--clr-accent)" />
              </div>
              <div>
                <div className="stat-number">{projectSummary?.totalUsers ?? '—'}</div>
                <div className="stat-label">Team Members</div>
              </div>
            </div>
          </>
        )}

        <div className="stat-card" style={{ '--card-accent': '#fbbf24', '--card-glow': 'linear-gradient(135deg, rgba(251,191,36,0.08), transparent)' }}>
          <div className="stat-icon" style={{ background: 'rgba(251,191,36,0.12)' }}>
            <Clock size={22} color="#fbbf24" />
          </div>
          <div>
            <div className="stat-number">{taskCounts?.['In-Progress'] ?? 0}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#10b981', '--card-glow': 'linear-gradient(135deg, rgba(16,185,129,0.08), transparent)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle size={22} color="#10b981" />
          </div>
          <div>
            <div className="stat-number">{taskCounts?.Done ?? 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#ef4444', '--card-glow': 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <AlertCircle size={22} color="#ef4444" />
          </div>
          <div>
            <div className="stat-number">{overdueTasks?.length ?? 0}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* ─── Chart + Completion ────────── */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Task Distribution</h2>
            <span className="tag">All Time</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={40} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--clr-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--clr-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 8, color: 'var(--clr-text)', fontSize: 13 }}
                  cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || STATUS_COLORS['In Progress']} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Overall Progress</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--clr-primary-glow)', lineHeight: 1 }}>{completionPct}%</div>
              <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', marginTop: 6 }}>Tasks Completed</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8 }}>
                <span>Progress</span>
                <span>{taskCounts?.Done ?? 0} / {taskCounts?.total ?? 0} tasks</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 8 }}>
              {chartData.map(({ name, value }) => (
                <div key={name} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>{name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tables ─────────────────────── */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="#ef4444" /> Overdue Tasks
            </h2>
            <span className="badge badge-overdue">{overdueTasks?.length}</span>
          </div>
          {overdueTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <CheckCircle size={32} color="#10b981" style={{ opacity: 0.6 }} />
              <p className="mt-8 text-muted text-sm">No overdue tasks 🎉</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Task</th><th>Project</th><th>Due</th></tr></thead>
                <tbody>
                  {overdueTasks?.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td><span className="tag">{t.project?.name}</span></td>
                      <td style={{ color: '#ef4444', fontSize: '0.8rem' }}>{t.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--clr-primary-glow)" /> Upcoming (7 days)
            </h2>
            <span className="badge badge-in-progress">{upcomingDeadlines?.length}</span>
          </div>
          {upcomingDeadlines?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Calendar size={32} style={{ opacity: 0.3 }} />
              <p className="mt-8 text-muted text-sm">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Task</th><th>Project</th><th>Due</th></tr></thead>
                <tbody>
                  {upcomingDeadlines?.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td><span className="tag">{t.project?.name}</span></td>
                      <td style={{ color: '#fbbf24', fontSize: '0.8rem' }}>{t.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
