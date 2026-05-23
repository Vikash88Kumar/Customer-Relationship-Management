import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Factory
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Leads & Pipeline", icon: Users },
    { id: "quotations", label: "Quotations Builder", icon: FileText },
    { id: "catalog", label: "Product Catalog", icon: Package },
    { id: "performance", label: "Performance Matrix", icon: TrendingUp },
  ];

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? "collapsed" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Factory className="brand-icon" size={24} />
        {!isCollapsed && <span className="brand-name text-gradient">ForgeCRM</span>}
      </div>

      {/* Collapse Toggle */}
      <button 
        className="collapse-btn" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Main Navigation Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`menu-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} className="menu-icon" />
              {!isCollapsed && <span className="menu-label">{item.label}</span>}
              {activeTab === item.id && !isCollapsed && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      {user && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
              alt={user.name} 
              className="user-avatar"
            />
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role badge badge-muted">{user.role.replace("_", " ")}</span>
              </div>
            )}
          </div>
          <button 
            className="logout-btn" 
            onClick={onLogout}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
