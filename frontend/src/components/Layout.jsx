import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: '📊 Dashboard' },
  { path: '/students', label: '🎓 Students' },
  { path: '/attendance', label: '📋 Attendance' },
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-white shadow-md flex flex-col">
        <div className="p-5 border-b">
          <h1 className="font-bold text-blue-700 text-lg">🎓 AttendTrack</h1>
          <p className="text-xs text-gray-500 mt-1">Management System</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-lg text-sm transition
                ${location.pathname === item.path
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <button onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}