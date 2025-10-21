import { LayoutDashboard, ShoppingCart, Truck, Package, Headphones } from 'lucide-react';

interface BottomNavProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function BottomNav({ onNavigate, currentPage }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
