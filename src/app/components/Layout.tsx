import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ProfileModal } from './ProfileModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const currentProfile = {
    name: user?.name || 'Dr. Roberto Sánchez',
    email: user?.email || 'roberto.sanchez@dentalcarepro.com',
    phone: '+34 91 123 45 67',
    specialty: user?.specialty || 'Odontología General y Estética',
    licenseNumber: user?.licenseNumber || '28/28/12345',
    address: 'Calle Mayor 123, 28013 Madrid, España',
    birthDate: '1985-06-15',
    bio: 'Odontólogo con más de 15 años de experiencia en odontología general y estética dental.',
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',     path: '/'            },
    { icon: Calendar,        label: 'Citas',         path: '/appointments'},
    { icon: Users,           label: 'Pacientes',     path: '/patients'    },
    { icon: FileText,        label: 'Presupuestos',  path: '/budgets'     },
    { icon: CreditCard,      label: 'Facturación',   path: '/billing'     },
    { icon: Settings,        label: 'Configuración', path: '/settings'    },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex flex-col
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0066CC] rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3a4 4 0 0 0-4 4c0 3 1.5 5.5 4 7.5L12 21l6-6.5c2.5-2 4-4.5 4-7.5a4 4 0 0 0-4-4c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-tight">DentalCare Pro</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                  ${isActive
                    ? 'bg-[#0066CC] text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
                `}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="w-9 h-9 bg-[#0066CC] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              DR
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Dr. Roberto Sánchez</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Ver perfil</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6
                           bg-white dark:bg-gray-900
                           border-b border-gray-200 dark:border-gray-800
                           transition-colors duration-200">
          {/* Mobile menu */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mr-2"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pacientes, citas, tratamientos..."
                className="w-full pl-10 pr-4 py-2 text-sm
                           bg-gray-50 dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700
                           text-gray-900 dark:text-gray-100
                           placeholder-gray-400 dark:placeholder-gray-500
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC]/40
                           transition-colors"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         bg-gray-100 dark:bg-gray-800
                         hover:bg-gray-200 dark:hover:bg-gray-700
                         text-gray-600 dark:text-gray-300
                         transition-all duration-200"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark
                ? <Sun  className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl
                               hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-4.5 h-4.5 text-gray-500 dark:text-gray-400" style={{ width: '18px', height: '18px' }} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={currentProfile}
      />
    </div>
  );
}