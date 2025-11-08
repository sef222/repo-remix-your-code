import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/patients", icon: Users, label: "Patients" },
    { path: "/schedule", icon: Calendar, label: "Schedule" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-xl">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">DentalPro</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="p-4 border-t text-xs text-muted-foreground">
          <p>© 2024 DentalPro</p>
          <p className="mt-1">Offline Practice Manager</p>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-8 py-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
