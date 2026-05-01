import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch tasks');
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return (
    <div className="glass-card p-6 rounded-xl border border-red-500/30 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <div className="text-red-400 text-lg font-medium">{error}</div>
    </div>
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  
  const today = new Date();
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < today).length;

  const myTasks = tasks.filter(t => t.assignedTo && t.assignedTo._id === user._id);

  const StatCard = ({ title, value, icon, gradientClass, iconBgClass }) => (
    <div className={`glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
      <div className={`absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity ${gradientClass}`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${iconBgClass} shadow-lg backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 border-b border-slate-700/50 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400">Dashboard</h1>
          <p className="text-slate-400 mt-2 text-lg">Welcome back to your workspace, <span className="text-indigo-400 font-semibold">{user.name}</span>!</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl backdrop-blur-sm">
          <p className="text-indigo-300 text-sm font-medium flex items-center gap-2">
            <Clock size={16} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tasks" 
          value={totalTasks} 
          icon={<ListTodo size={28} className="text-blue-300" />}
          gradientClass="bg-gradient-to-r from-blue-600 to-cyan-500"
          iconBgClass="bg-blue-500/20"
        />
        <StatCard 
          title="Completed" 
          value={completedTasks} 
          icon={<CheckCircle size={28} className="text-emerald-300" />}
          gradientClass="bg-gradient-to-r from-emerald-500 to-teal-400"
          iconBgClass="bg-emerald-500/20"
        />
        <StatCard 
          title="Pending" 
          value={pendingTasks} 
          icon={<Clock size={28} className="text-amber-300" />}
          gradientClass="bg-gradient-to-r from-amber-500 to-orange-400"
          iconBgClass="bg-amber-500/20"
        />
        <StatCard 
          title="Overdue" 
          value={overdueTasks} 
          icon={<AlertCircle size={28} className="text-rose-300" />}
          gradientClass="bg-gradient-to-r from-rose-500 to-pink-500"
          iconBgClass="bg-rose-500/20"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-800/40 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <CheckSquare size={20} className="text-indigo-400" />
            </div>
            My Assigned Tasks
          </h2>
          <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-600">
            {myTasks.length} {myTasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>
        
        <div className="p-0">
          {myTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex justify-center items-center w-20 h-20 bg-slate-800 rounded-full mb-4 border border-slate-700">
                <CheckCircle size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300">You're all caught up!</h3>
              <p className="text-slate-500 mt-2">No tasks assigned to you right now. Take a breather.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-700/50">
              {myTasks.map((task, idx) => (
                <li key={task._id} className="p-6 hover:bg-slate-700/20 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 font-mono text-xs text-slate-500 font-bold w-6">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">
                            {task.project?.name || 'Unknown Project'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-10 md:ml-0">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm
                        ${task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          task.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          'bg-slate-700/50 text-slate-300 border border-slate-600'}`}>
                        {task.status.toUpperCase()}
                      </span>
                      {task.dueDate && (
                        <div className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg border ${new Date(task.dueDate) < today && task.status !== 'Completed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-medium' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'}`}>
                          <Calendar size={14} />
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Assuming Calendar component isn't imported from lucide-react in the original, we should add it. Let's fix the imports too.
// I will just use a simple SVG or import Calendar.
import { Calendar, CheckSquare } from 'lucide-react';

export default Dashboard;
