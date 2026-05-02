import { useEffect, useState } from 'react';
import { ChevronDown, Plus, MoreHorizontal, FileText, Layout, Info, Clock, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const STATUS_COLORS = [
  { name: 'Todo', color: '#94a3b8' },
  { name: 'In-Progress', color: '#f59e0b' },
  { name: 'Done', color: '#10b981' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchStats = (isInitial = false) => {
      api.get('/dashboard/stats')
        .then((r) => setStats(r.data.data))
        .catch(() => {})
        .finally(() => {
          if (isInitial) setLoading(false);
        });
    };

    fetchStats(true);
    const interval = setInterval(() => fetchStats(false), 30000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderTopColor: 'var(--clr-primary)' }} />
        <span>Syncing workspace…</span>
      </div>
    );
  }

  const { taskCounts, projectSummary, overdueTasks, upcomingDeadlines } = stats || {};

  const chartData = [
    { name: 'Todo', value: taskCounts?.Todo || 0 },
    { name: 'In Progress', value: taskCounts?.['In-Progress'] || 0 },
    { name: 'Done', value: taskCounts?.Done || 0 },
  ];

  const hasData = taskCounts?.total > 0;

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="animate-fade">
      {/* ─── Top Navigation ────────────────── */}
      <div className="page-header" style={{ marginBottom: 32, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <h1 className="page-title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>
            {isAdmin ? 'Global Dashboard' : 'My Workspace'}
          </h1>
          <ChevronDown size={18} color="var(--clr-primary)" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {isAdmin && <button className="btn btn-primary btn-sm" style={{ padding: '8px 16px', borderRadius: 8 }}>Add Widget</button>}
          <button className="btn btn-secondary btn-icon btn-sm" style={{ padding: 8, borderRadius: 8 }}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* ─── Stat Widgets Row ────────────────── */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Open Tasks', val: (taskCounts?.total || 0) - (taskCounts?.Done || 0) },
          { label: 'Closed Tasks', val: taskCounts?.Done || 0 },
          isAdmin && { label: 'Open Phases', val: projectSummary?.totalProjects || 0 },
          isAdmin && { label: 'Total Users', val: projectSummary?.totalUsers || 0 },
          !isAdmin && { label: 'Upcoming', val: upcomingDeadlines?.length || 0 },
          !isAdmin && { label: 'Overdue', val: overdueTasks?.length || 0 },
        ].filter(Boolean).map((s, i) => (
          <div key={i} className="card stat-widget" style={{ textAlign: 'center', padding: '24px 10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', transition: 'none' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--clr-text)', letterSpacing: '-0.02em' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ─── Primary Dashboard Grid ────────── */}
      <div className="grid-2" style={{ gap: 24 }}>
        
        {/* Panel 1: Task Distribution (Chart) */}
        <div className="card" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--clr-border)', marginBottom: 0 }}>
            <h3 className="card-title" style={{ fontSize: '0.9rem', fontWeight: 700 }}>Task Distribution</h3>
            <MoreHorizontal size={16} color="var(--clr-text-muted)" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column' }}>
            {!hasData ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ opacity: 0.1, marginBottom: 16 }}><FileText size={48} /></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>No tasks found in this workspace.</p>
              </div>
            ) : (
              <>
                <div style={{ height: 240, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--clr-text-muted)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--clr-text-muted)' }} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 8, fontSize: 12 }} 
                        cursor={{ fill: 'var(--clr-bg)', opacity: 0.4 }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS.find(c => c.name === (entry.name === 'In Progress' ? 'In-Progress' : entry.name))?.color || '#0067ff'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
                  {STATUS_COLORS.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-text-muted)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                      {c.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel 2: Overdue Tasks */}
        <div className="card" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--clr-border)', marginBottom: 0 }}>
            <h3 className="card-title" style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="var(--clr-danger)" /> Overdue Work Items
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
              {overdueTasks?.length || 0}
            </span>
          </div>
          <div style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
            {!overdueTasks || overdueTasks.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <div style={{ opacity: 0.1, marginBottom: 20 }}><CheckCircle size={64} color="var(--clr-success)" /></div>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>Great job! No overdue items.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--clr-surface-2)' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--clr-text-light)' }}>Task Name</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--clr-text-light)' }}>Project</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--clr-text-light)' }}>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueTasks.slice(0, 6).map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 500 }}>{t.title}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{t.project?.name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--clr-danger)', fontWeight: 600 }}>{t.due_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Upcoming Deadlines */}
        <div className="card" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--clr-border)', marginBottom: 0 }}>
            <h3 className="card-title" style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--clr-primary)" /> Upcoming Deadlines
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-primary)', background: 'var(--clr-primary-subtle)', padding: '2px 8px', borderRadius: 4 }}>
              {upcomingDeadlines?.length || 0}
            </span>
          </div>
          <div style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
            {!upcomingDeadlines || upcomingDeadlines.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <div style={{ opacity: 0.1, marginBottom: 20 }}><Clock size={64} /></div>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>No tasks due in the next 7 days.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--clr-surface-2)' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--clr-text-light)' }}>Task Name</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--clr-text-light)' }}>Due In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingDeadlines.slice(0, 6).map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 500 }}>{t.title}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--clr-warning)', fontWeight: 600 }}>
                          {new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panel 4: Quick Summary (Pie Chart) */}
        <div className="card" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--clr-border)', marginBottom: 0 }}>
            <h3 className="card-title" style={{ fontSize: '0.9rem', fontWeight: 700 }}>Task Health</h3>
            <MoreHorizontal size={16} color="var(--clr-text-muted)" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!hasData ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ opacity: 0.1, marginBottom: 16 }}><Layout size={48} /></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>No stats available.</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS.find(c => c.name === (entry.name === 'In Progress' ? 'In-Progress' : entry.name))?.color || '#0067ff'} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 8, fontSize: 12 }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: -150, pointerEvents: 'none' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-text)' }}>{taskCounts?.total || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>TOTAL TASKS</div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
