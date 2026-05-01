import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { FolderKanban, Plus, Users, ArrowRight } from 'lucide-react';

const ProjectList = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, usersRes] = await Promise.all([
          api.get('/api/projects'),
          user.role === 'Admin' ? api.get('/api/auth/users') : Promise.resolve({ data: [] })
        ]);
        setProjects(projRes.data);
        if (user.role === 'Admin') {
          setAllUsers(usersRes.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/projects', {
        name: newProjectName,
        description: newProjectDesc,
        members: selectedMembers,
      });
      setProjects([...projects, data]);
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setSelectedMembers([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
  if (error) return <div className="text-red-400 text-center py-10 glass-card rounded-xl">{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-700/50">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400">Projects</h1>
          <p className="text-slate-400 mt-2 text-lg">Manage and view your team workspaces</p>
        </div>
        {user.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus size={20} /> <span className="font-semibold">New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, idx) => (
          <Link to={`/projects/${project._id}`} key={project._id} className="block group h-full">
            <div className="glass-card rounded-2xl p-6 h-full flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] transition-all duration-300 relative overflow-hidden border border-slate-700/50 hover:border-indigo-500/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-colors duration-300 shadow-inner">
                  <FolderKanban size={24} className="text-indigo-400 group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full shadow-sm">
                  {project.tasksCount !== undefined ? project.tasksCount : '?'} Tasks
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors relative z-10">{project.name}</h3>
              <p className="text-slate-400 text-sm flex-grow line-clamp-3 mb-6 relative z-10 leading-relaxed">
                {project.description || 'No description provided for this workspace.'}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-700/50 relative z-10">
                <div className="flex items-center text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Users size={16} className="mr-2 text-indigo-400" />
                  {project.members?.length || 0} Members
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-indigo-400 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-24 glass-card rounded-2xl border border-dashed border-slate-600">
          <div className="inline-flex justify-center items-center w-24 h-24 bg-slate-800/80 rounded-full mb-6 border border-slate-700 shadow-inner">
            <FolderKanban size={40} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">No Projects Found</h3>
          <p className="text-slate-400 mt-2 text-lg max-w-md mx-auto">You haven't been assigned to any projects yet or none exist. Check back later.</p>
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="glass-card rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-700">
            <h2 className="text-3xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3 rounded-xl glass-input outline-none"
                  placeholder="e.g. Website Redesign"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  className="w-full px-5 py-3 rounded-xl glass-input outline-none resize-none"
                  rows="3"
                  placeholder="Briefly describe the project goals..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assign Team Members</label>
                <div className="max-h-48 overflow-y-auto rounded-xl glass-input p-2 space-y-1">
                  {allUsers.filter(u => u.role !== 'Admin').map(u => (
                    <label key={u._id} className="flex items-center p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-700">
                      <input
                        type="checkbox"
                        className="mr-4 w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 bg-slate-800"
                        checked={selectedMembers.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{u.name}</span>
                        <span className="text-slate-400 text-xs">{u.email}</span>
                      </div>
                    </label>
                  ))}
                  {allUsers.filter(u => u.role !== 'Admin').length === 0 && (
                    <p className="text-sm text-slate-500 p-4 text-center">No team members available to assign.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-3 rounded-xl font-bold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
