import React from "react";
import { Search, Bell, HelpCircle, Sun, Moon } from "lucide-react";
import "./Header.css";

export default function Header({ activeTab, theme, onToggleTheme, notificationsCount = 3 }) {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case "dashboard": return "Operations Dashboard";
      case "leads": return "Leads & B2B Pipeline";
      case "quotations": return "Commercial Quotations Builder";
      case "catalog": return "Manufacturing Product Catalog";
      case "performance": return "Sales Performance Matrix";
      default: return "ForgeCRM";
    }
  };

  return (
    <header className="header glass-panel">
      {/* breadcrumb */}
      <div className="breadcrumb-area">
        <span className="breadcrumb-root">Workspace</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{getBreadcrumb()}</span>
      </div>

      {/* right elements */}
      <div className="header-actions">
        {/* search */}
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search leads, SKUs, quotes..." 
            className="search-input"
          />
        </div>

        {/* theme toggle */}
        <button 
          className="icon-action-btn" 
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* notifications */}
        <button className="icon-action-btn notification-btn" title="View Notifications">
          <Bell size={16} />
          {notificationsCount > 0 && (
            <span className="notification-badge">{notificationsCount}</span>
          )}
        </button>

        {/* help */}
        <button className="icon-action-btn" title="Documentation & Help">
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
}
