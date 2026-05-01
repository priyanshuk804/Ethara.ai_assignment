import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Plus, ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, Edit2, Trash2, User, MoreVertical } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/tasks?projectId=${id}`),
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch project details');
        setLoading(false);
      }
    };
    fetchProjectAndTasks();
  }, [id]);

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { data } = await api.put(`/api/tasks/${editingTaskId}`, {
          title: newTaskTitle,
          description: newTaskDesc,
          dueDate: newTaskDueDate || undefined,
          assignedTo: newTaskAssignee || null,
        });
        setTasks(tasks.map(t => t._id === editingTaskId ? data : t));
      } else {
        const { data } = await api.post('/api/tasks', {
          title: newTaskTitle,
          description: newTaskDesc,
          dueDate: newTaskDueDate || undefined,
          project: id,
          assignedTo: newTaskAssignee || null,
        });
        setTasks([...tasks, data]);
      }
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: data.status } : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this ENTIRE project? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const openEditModal = (task) => {
    setIsEditing(true);
    setEditingTaskId(task._id);
    setNewTaskTitle(task.title);
    setNewTaskDesc(task.description);
    setNewTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setNewTaskAssignee(task.assignedTo?._id || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingTaskId(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDueDate('');
    setNewTaskAssignee('');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
  if (error) return <div className="text-red-400 text-center py-10 glass-card rounded-xl">{error}</div>;

  const StatusColumn = ({ status, title, icon, colorClass, borderClass, headerBg }) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className={`glass-card rounded-2xl flex flex-col h-full border-t-4 ${borderClass}`}>
        <div className={`px-5 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/40 rounded-t-xl`}>
          <h3 className="font-bold text-white flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${headerBg} shadow-inner`}>
              {icon}
            </div>
            {title}
          </h3>
          <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-inner border border-slate-600">
            {columnTasks.length}
          </span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar min-h-[400px]">
          {columnTasks.map(task => (
            <div key={task._id} className="bg-slate-800/80 p-5 rounded-xl shadow-lg border border-slate-700 hover:border-indigo-500/50 hover:shadow-[0_10px_20px_-10px_rgba(99,102,241,0.3)] transition-all duration-300 group relative">
              
              <h4 className="font-bold text-white mb-2 pr-8">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium">
                {task.dueDate && (
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border shadow-sm
                    ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-slate-700/50 text-slate-300 border-slate-600'}`}>
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {task.assignedTo && (
                  <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md shadow-sm">
                    <User size={12} />
                    {task.assignedTo.name.split(' ')[0]}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-2">
                {/* Status Updater */}
                {(user.role === 'Admin' || (task.assignedTo && task.assignedTo._id === user._id)) ? (
                  <select
                    className="text-xs font-medium bg-slate-900 border border-slate-600 text-slate-300 rounded-lg p-1.5 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">Locked</span>
                )}

                {/* Admin Controls */}
                {user.role === 'Admin' && (
                  <div className="flex items-center gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(task)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-xl">
              <div className="p-3 bg-slate-800/50 rounded-full mb-3">
                {icon}
              </div>
              Drop tasks here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div>
        <Link to="/projects" className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full mb-4">
          <ArrowLeft size={16} className="mr-1.5" /> Back to Projects
        </Link>

        <div className="glass-card p-8 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{project.name}</h1>
            <p className="text-slate-400 max-w-3xl leading-relaxed text-lg">{project.description}</p>
            
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center text-slate-300">
                <span className="text-slate-500 mr-2 font-medium">Lead:</span> 
                <span className="font-semibold text-indigo-300">{project.createdBy?.name}</span>
              </div>
              
              <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center text-slate-300">
                <span className="text-slate-500 mr-2 font-medium">Team:</span> 
                <div className="flex -space-x-2 mr-2">
                  {project.members?.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title={m.name}>
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                {project.members?.length === 0 && <span className="text-slate-500 italic">No members</span>}
              </div>
            </div>
          </div>
          
          {user.role === 'Admin' && (
            <div className="flex flex-col gap-3 relative z-10 flex-shrink-0">
              <button
                onClick={() => { closeModal(); setShowModal(true); }}
                className="btn-primary py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg w-full"
              >
                <Plus size={20} /> <span className="font-bold">Create Task</span>
              </button>
              <button
                onClick={handleDeleteProject}
                className="py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg w-full bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-bold"
              >
                <Trash2 size={20} /> Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start min-h-[500px]">
        <StatusColumn 
          status="Todo" 
          title="To Do" 
          icon={<AlertCircle size={18} className="text-slate-400" />} 
          colorClass="text-slate-400"
          borderClass="border-slate-500"
          headerBg="bg-slate-500/20"
        />
        <StatusColumn 
          status="In Progress" 
          title="In Progress" 
          icon={<Clock size={18} className="text-indigo-400" />} 
          colorClass="text-indigo-400"
          borderClass="border-indigo-500"
          headerBg="bg-indigo-500/20"
        />
        <StatusColumn 
          status="Completed" 
          title="Done" 
          icon={<CheckCircle size={18} className="text-emerald-400" />} 
          colorClass="text-emerald-400"
          borderClass="border-emerald-500"
          headerBg="bg-emerald-500/20"
        />
      </div>

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="glass-card rounded-2xl shadow-2xl w-full max-w-xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleCreateOrUpdateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3 rounded-xl glass-input outline-none"
                  placeholder="e.g. Design Landing Page"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  className="w-full px-5 py-3 rounded-xl glass-input outline-none resize-none"
                  rows="4"
                  placeholder="Add details, acceptance criteria, etc..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-5 py-3 rounded-xl glass-input outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Assignee</label>
                  <select
                    className="w-full px-5 py-3 rounded-xl glass-input outline-none [&>option]:bg-slate-800 [&>option]:text-white cursor-pointer"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-3 rounded-xl font-bold"
                >
                  {isEditing ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
