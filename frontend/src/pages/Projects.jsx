import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Users, ChevronRight, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

function ProjectModal({ onClose, onCreated }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/projects', data);
      toast.success('Project created!');
      reset();
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Project</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} id="form-create-project">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="proj-name">Project Name *</label>
              <input id="proj-name" className="form-control" placeholder="e.g. Website Redesign" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="proj-desc">Description</label>
              <textarea id="proj-desc" className="form-control" rows={3} placeholder="What is this project about?" {...register('description')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" id="btn-create-project" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Plus size={18} /> Create Project</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'Admin';

  const fetchProjects = () => {
    api.get('/projects').then((r) => setProjects(r.data.data.projects)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const deleteProject = async (id, name) => {
    if (!confirm(`Delete project "${name}"? All tasks will be permanently removed.`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted.');
      setProjects((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {isAdmin && (
          <button id="btn-new-project" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--clr-primary)' }} /></div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: '80px 0' }}>
          <div className="empty-state">
            <div className="empty-state-icon"><FolderKanban size={32} /></div>
            <h2 className="empty-state-title">No projects yet</h2>
            <p className="empty-state-text">{isAdmin ? 'Create your first project to get started and assign your team.' : 'You haven\'t been assigned to any projects yet.'}</p>
            {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Create Project</button>}
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--clr-primary-subtle)', display: 'grid', placeItems: 'center' }}>
                  <FolderKanban size={24} color="var(--clr-primary)" />
                </div>
                {isAdmin && (
                  <button
                    className="btn btn-secondary btn-icon btn-sm"
                    onClick={() => deleteProject(p.id, p.name)}
                    style={{ color: 'var(--clr-danger)', borderColor: 'transparent' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{p.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', flex: 1, marginBottom: 24 }}>
                {p.description || 'No description provided for this project.'}
              </p>

              <div style={{ paddingTop: 20, borderTop: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>
                  <Users size={14} />
                  <span>{p.members?.length ?? 0} Team Member{p.members?.length !== 1 ? 's' : ''}</span>
                </div>
                <Link to={`/projects/${p.id}`} className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
                  View <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onCreated={fetchProjects} />}
    </div>
  );
}
