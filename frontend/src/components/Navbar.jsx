import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive 
        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
    }`;
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-700/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                Ethara Tasks
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link to="/" className={navLinkClass('/')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link to="/projects" className={navLinkClass('/projects')}>
                <FolderKanban className="w-4 h-4 mr-2" />
                Projects
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-1.5 rounded-full shadow-inner">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-medium text-slate-200">
                  {user.name} <span className="text-indigo-400 opacity-80 text-xs ml-1">({user.role})</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors border border-transparent hover:border-pink-500/20 flex items-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
