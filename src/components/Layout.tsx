import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, TrendingUp, Grid3X3, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/add', icon: Plus, label: 'Add', isSpecial: true },
  { path: '/friends', icon: Users, label: 'Friends' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bottom-nav h-20 px-4">
        <div className="flex items-center justify-around h-full max-w-md mx-auto">
          {navItems.map(({ path, icon: Icon, label, isSpecial }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center relative transition-all duration-300",
                isSpecial
                  ? "fab w-14 h-14 -mt-6 rounded-full"
                  : "p-2 rounded-lg w-16 h-12",
                location.pathname === path
                  ? isSpecial
                    ? "text-primary-foreground"
                    : "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                size={isSpecial ? 24 : 20} 
                className={cn(
                  "transition-transform duration-200",
                  location.pathname === path && !isSpecial && "scale-110"
                )}
              />
              {!isSpecial && (
                <span className="text-xs mt-1 font-medium">{label}</span>
              )}
              
              {/* Active indicator */}
              {location.pathname === path && !isSpecial && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;