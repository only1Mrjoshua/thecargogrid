import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, Users, Settings,
  LogOut, Bell, Menu, X, DollarSign, FileText, Receipt, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Shipments', icon: Package, href: '/admin/shipments' },
  { label: 'Customers', icon: Users, href: '/admin/users' },
  { label: 'Payments', icon: DollarSign, href: '/admin/payments' },
  { label: 'Invoices', icon: FileText, href: '/admin/invoices' },
  { label: 'Receipts', icon: Receipt, href: '/admin/receipts' },
  { label: 'Notifications', icon: Send, href: '/admin/notifications' },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#1A1A2E] text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <img src="/logo.png" alt="The Cargo Grid" className="h-8 w-auto object-contain brightness-0 invert" />
            <span className="text-sm font-bold tracking-tight">Admin Panel</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#FF5500] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="mb-2 px-4 py-2 text-xs text-white/40">
              Logged in as {user?.name || 'Admin'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-[#E2E5F0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-[#1A1A2E] hover:bg-[#F8F9FD] rounded-xl transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold text-[#1A1A2E]">
              {navItems.find((item) => item.href === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#1A1A2E]/60 hover:text-[#1A1A2E] hover:bg-[#F8F9FD] rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5500] rounded-full animate-pulse" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#2B0071] text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;