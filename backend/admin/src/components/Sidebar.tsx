'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Leaf,
  Droplets,
  ShoppingBag,
  Calendar,
  Bell,
  Users,
  BarChart3,
  Settings,
  Award,
  Heart,
  BookOpen,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Remèdes', href: '/remedies', icon: Leaf },
  { name: 'Huiles essentielles', href: '/essential-oils', icon: Droplets },
  { name: 'Produits Amazon', href: '/products', icon: ShoppingBag },
  { name: 'Contenu du jour', href: '/daily-content', icon: Calendar },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Badges', href: '/badges', icon: Award },
  { name: 'Catégories', href: '/categories', icon: BookOpen },
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Statistiques', href: '/stats', icon: BarChart3 },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Heart className="w-8 h-8 text-green-600" />
        <span className="ml-2 text-lg font-semibold text-gray-900">
          Savoirs Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-colors duration-150
                ${isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-green-700">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Admin</p>
            <p className="text-xs text-gray-500">admin@savoirs.fr</p>
          </div>
        </div>
      </div>
    </div>
  );
}
