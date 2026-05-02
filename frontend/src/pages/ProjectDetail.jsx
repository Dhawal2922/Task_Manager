import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Users, Trash2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const STATUS_BADGE = { 'Todo': 'badge-todo', 'In-Progress': 'badge-in-progress', 'Done': 'badge-done' };
const PRIORITY_BADGE = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high' };

function TaskModal({ projectId, members, onClose, onCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { status: 'Todo', priority: 'Medium' } });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, data);
      toast.success('Task created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Task</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} id="form-create-task">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" placeholder="Task title…" {...register('title', { required: 'Title required' })} />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} placeholder="Details…" {...register('description')} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" {...register('status')}>
                  <option>Todo</option><option>In-Progress</option><option>Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control" {...register('priority')}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" {...register('due_date')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assign To</label>
                <select className="form-control" {...register('assigned_to_id')}>
                  <option value="">Unassigned</option>
                  {members?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" id="btn-submit-task" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Plus size={18} /> Create Task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/projects').then(() => {});
    // Fetch all users for admin
    api.get('/auth/me').then(() => {});
    // We'll just show an input for user ID (in a real app, you'd have a user search)
    fetch('/api/projects').then(() => {});
    api.get('/dashboard/stats').then(() => {}); // just to have an endpoint example
  }, []);

  const handleAdd = async () => {
    if (!userId.trim()) return toast.error('Please enter a User ID.');
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { user_id: userId });
      toast.success('Member added!');
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Member</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">User ID</label>
            <input className="form-control" placeholder="Paste the User UUID…" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <p className="text-xs text-muted" style={{ marginTop: 12 }}>You can find user IDs in the Team Members page.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="btn-add-member" className="btn btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? <span className="spinner" /> : <><UserPlus size={16} /> Add Member</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'Admin';

  const fetchProject = () => {
    api.get(`/projects/${id}`).then((r) => setProject(r.data.data.project)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  const deleteTask = async (taskId, title) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      toast.success('Task deleted.');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated.');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--clr-primary)' }} /></div>;
  if (!project) return <div className="empty-state"><p>Project not found.</p></div>;

  const tasksByStatus = {
    'Todo': project.tasks?.filter((t) => t.status === 'Todo') || [],
    'In-Progress': project.tasks?.filter((t) => t.status === 'In-Progress') || [],
    'Done': project.tasks?.filter((t) => t.status === 'Done') || [],
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <Link to="/projects" className="btn btn-ghost btn-sm mb-16" style={{ display: 'inline-flex', marginBottom: 12 }}>
            <ArrowLeft size={14} /> Back to Projects
          </Link>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <>
              <button className="btn btn-ghost btn-sm" id="btn-add-member-open" onClick={() => setShowMemberModal(true)}>
                <UserPlus size={14} /> Add Member
              </button>
              <button className="btn btn-primary" id="btn-add-task" onClick={() => setShowTaskModal(true)}>
                <Plus size={16} /> Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── Members ─────────────────────── */}
      <div className="card mb-24">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> Team Members</h2>
          <span className="badge badge-member">{project.members?.length}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {project.members?.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 8, padding: '6px 12px' }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                {m.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.name}</div>
                <div className={`badge ${m.role === 'Admin' ? 'badge-admin' : 'badge-member'}`} style={{ marginTop: 2 }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Kanban Board ────────────────── */}
      <h2 className="section-title">Tasks — Kanban View</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span className={`badge ${STATUS_BADGE[status]}`}>{status}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>{tasks.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((task) => {
                const isMyTask = task.assigned_to_id === user?.id;
                const canChangeStatus = isAdmin || isMyTask;
                return (
                  <div key={task.id} className="card" style={{ padding: 14, cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1 }}>{task.title}</h4>
                      {isAdmin && (
                        <button className="btn btn-danger btn-icon btn-sm" id={`btn-delete-task-${task.id}`} onClick={() => deleteTask(task.id, task.title)}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                    {task.description && <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 4, marginBottom: 8 }}>{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
                      {task.due_date && <span className="tag">📅 {task.due_date}</span>}
                    </div>
                    {task.assignee && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div className="avatar" style={{ width: 18, height: 18, fontSize: '0.55rem' }}>
                          {task.assignee.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        {task.assignee.name}
                      </div>
                    )}
                    {canChangeStatus && (
                      <select
                        className="form-control"
                        style={{ marginTop: 10, fontSize: '0.75rem', padding: '4px 8px' }}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        id={`select-status-${task.id}`}
                        title={isAdmin ? 'Admin: change any status' : 'Member: update your task status'}
                      >
                        <option>Todo</option><option>In-Progress</option><option>Done</option>
                      </select>
                    )}
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--clr-text-faint)', fontSize: '0.8rem' }}>
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <TaskModal projectId={id} members={project.members} onClose={() => setShowTaskModal(false)} onCreated={fetchProject} />
      )}
      {showMemberModal && (
        <AddMemberModal projectId={id} onClose={() => setShowMemberModal(false)} onAdded={fetchProject} />
      )}
    </div>
  );
}
