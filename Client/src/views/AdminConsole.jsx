import React from "react";
import { 
  Lock, 
  Users, 
  Activity, 
  FileCheck, 
  Database,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ShieldCheck
} from "lucide-react";
import "./AdminConsole.css";

export default function AdminConsole() {
  // Mock recent compliance audit logs representing auditLog.model.js
  const [auditLogs, setAuditLogs] = React.useState([
    { id: "log_1", action: "QUOTATION_REVISED", user: "Vikash Kumar", role: "BDA", target: "QT-2026-081 (v1)", ip: "192.168.1.42", time: "10 mins ago" },
    { id: "log_2", action: "LEAD_STATUS_UPDATE", user: "Vikash Kumar", role: "BDA", target: "Tata Motors Defence Division", ip: "192.168.1.42", time: "2 hours ago" },
    { id: "log_3", action: "USER_LOGIN", user: "Neha Sharma", role: "BDA_Manager", target: "Workspace Portal", ip: "192.168.1.18", time: "3 hours ago" },
    { id: "log_4", action: "LEAD_ASSIGNMENT", user: "System", role: "Automated", target: "Haldiram Processors ➔ Pooja Patel", ip: "127.0.0.1", time: "1 day ago" }
  ]);

  // Mock User / BDA Accounts management
  const [bdas, setBdas] = React.useState([
    { id: "u_1", name: "Pooja Patel", email: "pooja.bda@forgecrm.com", role: "Senior BDA", target: 1000000, isActive: true },
    { id: "u_2", name: "Vikash Kumar", email: "vikash.bda@forgecrm.com", role: "BDA Sales Agent", target: 1000000, isActive: true },
    { id: "u_3", name: "Rahul Sharma", email: "rahul.bda@forgecrm.com", role: "Junior BDA", target: 1000000, isActive: false }
  ]);

  // Toggle employee status dynamically
  const toggleBdaActive = (bdaId) => {
    setBdas(prev => prev.map(b => {
      if (b.id === bdaId) {
        const nextState = !b.isActive;
        // Inject an audit log dynamically in the stream representing real-time audits!
        const auditItem = {
          id: `log_${Date.now()}`,
          action: "BDA_STATUS_TOGGLE",
          user: "Vikram Rathore",
          role: "Admin",
          target: `${b.name} ➔ ${nextState ? "Active" : "Inactive"}`,
          ip: "192.168.1.1",
          time: "Just now"
        };
        setAuditLogs([auditItem, ...auditLogs]);
        return { ...b, isActive: nextState };
      }
      return b;
    }));
  };

  // Aggregated system stats in Rupees (₹)
  const systemStats = [
    { label: "Total CRM Accounts", value: "5 Users", change: "3 BDAs / 1 Manager", icon: Users, color: "info" },
    { label: "Won Sales Potential", value: "₹9.73 Lakhs", change: "From tata motors quote", icon: FileCheck, color: "success" },
    { label: "Total Compliance Audits", value: `${auditLogs.length} Records`, change: "Real-time stream active", icon: Activity, color: "warning" },
    { label: "System Health Status", value: "Optimal", change: "DB connected (Cluster0)", icon: Database, color: "success" }
  ];

  return (
    <div className="admin-console-view fade-in">
      
      {/* Overview Cards */}
      <div className="stats-grid">
        {systemStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="stat-card glass-panel card-lift">
              <div className="stat-card-header">
                <span className="stat-label">{stat.label}</span>
                <div className={`stat-icon-wrap icon-${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <span className="stat-desc">{stat.change}</span>
            </div>
          );
        })}
      </div>

      {/* Main Console Split Layout */}
      <div className="admin-split-grid">
        
        {/* Left Side: Compliance Audit Log Trails */}
        <div className="audit-logs-card glass-panel card-lift">
          <div className="panel-header-inline">
            <h4 className="card-heading">Compliance Audit Activity Trails</h4>
            <span className="badge badge-error">AS9100 Verified</span>
          </div>

          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Action Log</th>
                  <th>Operator</th>
                  <th>Entity Target</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="audit-row-hover">
                    <td>
                      <span className={`badge ${
                        log.action.includes("REVISED") ? "badge-warning" : 
                        log.action.includes("STATUS") ? "badge-info" : 
                        log.action.includes("LOGIN") ? "badge-success" : 
                        "badge-error"
                      }`}>{log.action.replace(/_/g, ' ')}</span>
                    </td>
                    <td>
                      <div className="operator-cell">
                        <strong>{log.user}</strong>
                        <small>{log.role}</small>
                      </div>
                    </td>
                    <td><span className="target-cell-indicator">{log.target}</span></td>
                    <td><span className="ip-indicator">{log.ip}</span></td>
                    <td><span className="time-indicator">{log.time}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Managed BDA Team Accounts */}
        <div className="bda-management-card glass-panel card-lift">
          <div className="panel-header-inline">
            <h4 className="card-heading">Associate Account Allocations</h4>
            <ShieldCheck size={18} className="shield-icon" />
          </div>

          <div className="bda-mgmt-list">
            {bdas.map((bda) => (
              <div key={bda.id} className="bda-mgmt-row">
                <div className="bda-mgmt-profile">
                  <div className={`bda-status-dot ${bda.isActive ? "active-green" : "inactive-red"}`} />
                  <div className="bda-mgmt-details">
                    <strong>{bda.name}</strong>
                    <span>{bda.role} • {bda.email}</span>
                  </div>
                </div>

                <div className="bda-mgmt-quota">
                  <span>Quota target:</span>
                  <strong>₹{bda.target.toLocaleString("en-IN")}</strong>
                </div>

                <button 
                  className="bda-toggle-btn"
                  onClick={() => toggleBdaActive(bda.id)}
                  title={bda.isActive ? "Deactivate Account" : "Activate Account"}
                >
                  {bda.isActive ? (
                    <ToggleRight size={26} className="toggle-icon active-icon" />
                  ) : (
                    <ToggleLeft size={26} className="toggle-icon inactive-icon" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
