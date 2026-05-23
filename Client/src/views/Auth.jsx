import React from "react";
import { 
  Factory, 
  LogIn
} from "lucide-react";
import { LoginUser } from "../services/user.api.js";
import "./Auth.css";

export default function Auth({ onLoginSuccess }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("BDA"); // BDA or BDA_Manager
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setError("");
    try {
      const userData = await LoginUser({ email, password, role });
      onLoginSuccess(userData);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your workspace parameters.");
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      {/* Floating Brand Info at the Top-Left of Viewport */}
      <div className="floating-os-brand">
        <div className="brand-badge">
          <Factory size={16} />
          <span>ForgeCRM Community</span>
        </div>
        <div className="open-source-stats">
          <div className="os-badge-link">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            <span>v1.8.2</span>
          </div>
          <div className="os-stars-badge">
            ★ 28.4k
          </div>
        </div>
      </div>

      {/* Left-side floating CRM Marketing value block */}
      <div className="floating-marketing-block">
        <h1 className="marketing-title text-gradient">
          Manage your B2B manufacturing relations with absolute precision.
        </h1>
        <p className="marketing-subtitle">
          ForgeCRM is the community-driven manufacturing platform built specifically for heavy machinery, automotive assembly, aerospace fabrication, and custom metallurgy logistics.
        </p>

        <div className="marketing-features-list">
          <div className="m-feature-row">
            <div className="m-feature-dot" />
            <div className="m-feature-text">
              <strong>Rupee-Calibrated Pipelines:</strong>
              <span>Track deal potential in Indian Rupees (₹) across live columns.</span>
            </div>
          </div>
          <div className="m-feature-row">
            <div className="m-feature-dot" />
            <div className="m-feature-text">
              <strong>Split-Pane Quotation Constructor:</strong>
              <span>Generate AS9100D material proposals and auto-calculate 18% GST.</span>
            </div>
          </div>
          <div className="m-feature-row">
            <div className="m-feature-dot" />
            <div className="m-feature-text">
              <strong>Division Performance Diagnostics:</strong>
              <span>Inspect BDA SLAs, quotas, and division leaderboards.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Auth Panel - Aligned Right and Centered Vertically */}
      <div className="auth-card-panel">
        <div className="auth-card glass-panel active-pulse">
          
          {/* Header (Only Sign In at the Top) */}
          <div className="auth-header">
            <h2 className="auth-title">Access Workspace</h2>
            <p className="auth-subtitle">Sign in to administer your factory relationships</p>
          </div>

          {/* Form - Strictly dedicated to Sign In */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error-badge">{error}</div>}

            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <input 
                type="email" 
                placeholder="name@forgecrm.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            {/* Role-Based Access Dropdown */}
            <div className="form-group">
              <label className="form-label">Workspace Role Assignment</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="auth-input role-select"
              >
                <option value="BDA">BDA (Business Development Associate)</option>
                <option value="BDA_Manager">BDA Manager (Supervisor Account)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn">
              <LogIn size={16} /> Access Workspace
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
