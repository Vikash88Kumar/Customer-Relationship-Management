import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Auth from "./views/Auth";
import Dashboard from "./views/Dashboard";
import Leads from "./views/Leads";
import Quotations from "./views/Quotations";
import Catalog from "./views/Catalog";
import Performance from "./views/Performance";

export default function App() {
  const [user, setUser] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [theme, setTheme] = React.useState("dark");

  // Apply active theme to root document on mount and changes
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container fade-in">
      {/* Side drawer Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Structural Frame */}
      <div 
        className="main-viewport-frame" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          flexGrow: 1, 
          height: "100vh", 
          overflow: "hidden" 
        }}
      >
        {/* Header Action Bar with global theme handlers */}
        <Header 
          activeTab={activeTab} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* View render port */}
        <main 
          style={{ 
            flexGrow: 1, 
            overflow: "hidden", 
            display: "flex" 
          }}
        >
          {activeTab === "dashboard" && <Dashboard user={user} />}
          {activeTab === "leads" && <Leads user={user} />}
          {activeTab === "quotations" && <Quotations user={user} />}
          {activeTab === "catalog" && <Catalog />}
          {activeTab === "performance" && <Performance user={user} />} 
        </main>
      </div>
    </div>
  );
}
