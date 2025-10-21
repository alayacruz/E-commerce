import { LayoutDashboard, Package, ShoppingCart, LogOut, Store } from 'lucide-react';

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function Sidebar({ onNavigate, currentPage = 'dashboard' }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Your Products', icon: Package },
    { id: 'orders', label: 'All Orders', icon: ShoppingCart },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 pt-6">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <Store className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">SellerHub</span>
        </div>
      </div>

      <nav className="px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={() => alert('Logout functionality')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
