import { Search, User } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  showSearch?: boolean;
}

export default function Header_seller({ onNavigate, showSearch = true }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <h1 className="text-2xl font-bold text-gray-900">SellerHub</h1>

            {showSearch && (
              <div className="ml-8 flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products, orders..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <User className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
