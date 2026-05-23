import React from "react";
import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Target, 
  AlertCircle 
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard({ user }) {
  const isManager = user.role === "BDA_Manager";

  const [leads, setLeads] = React.useState([]);
  const [quotes, setQuotes] = React.useState([]);

  React.useEffect(() => {
    // Load leads
    const localLeads = localStorage.getItem("crm_leads_data");
    if (localLeads) {
      try { setLeads(JSON.parse(localLeads)); } catch (e) {}
    }
    // Load quotes
    const localQuotes = localStorage.getItem("crm_quotes_data");
    if (localQuotes) {
      try { setQuotes(JSON.parse(localQuotes)); } catch (e) {}
    }
  }, []);

  // Performance of a single BDA monthly data selector
  const [selectedBdaName, setSelectedBdaName] = React.useState(() => {
    return user.role === "BDA_Manager" ? "Pooja Patel" : user.name;
  });

  const bdaMonthlyData = React.useMemo(() => {
    const dataMap = {
      "Pooja Patel": {
        role: "Senior BDA",
        conversions: [1.2, 1.8, 2.2, 3.5, 4.8, 3.9],
        points: "M 65,150 L 145,130 L 225,110 L 305,75 L 385,30 L 455,50",
        areaGlow: "M 65,170 L 65,150 L 145,130 L 225,110 L 305,75 L 385,30 L 455,50 L 455,170 Z",
        circles: [
          { cx: 65, cy: 150, val: "₹1.2L" },
          { cx: 145, cy: 130, val: "₹1.8L" },
          { cx: 225, cy: 110, val: "₹2.2L" },
          { cx: 305, cy: 75, val: "₹3.5L" },
          { cx: 385, cy: 30, val: "₹4.8L" },
          { cx: 455, cy: 50, val: "₹3.9L" }
        ],
        targetMetPct: 132,
        closedDeals: 19
      },
      "Vikash Kumar": {
        role: "BDA Sales Agent",
        conversions: [0.8, 1.2, 1.0, 2.1, 2.8, 2.2],
        points: "M 65,160 L 145,150 L 225,155 L 305,120 L 385,95 L 455,115",
        areaGlow: "M 65,170 L 65,160 L 145,150 L 225,155 L 305,120 L 385,95 L 455,115 L 455,170 Z",
        circles: [
          { cx: 65, cy: 160, val: "₹0.8L" },
          { cx: 145, cy: 150, val: "₹1.2L" },
          { cx: 225, cy: 155, val: "₹1.0L" },
          { cx: 305, cy: 120, val: "₹2.1L" },
          { cx: 385, cy: 95, val: "₹2.8L" },
          { cx: 455, cy: 115, val: "₹2.2L" }
        ],
        targetMetPct: 89,
        closedDeals: 14
      },
      "Rahul Sharma": {
        role: "Junior BDA",
        conversions: [0.5, 0.7, 0.9, 1.5, 2.1, 1.6],
        points: "M 65,165 L 145,160 L 225,158 L 305,140 L 385,120 L 455,135",
        areaGlow: "M 65,170 L 65,165 L 145,160 L 225,158 L 305,140 L 385,120 L 455,135 L 455,170 Z",
        circles: [
          { cx: 65, cy: 165, val: "₹0.5L" },
          { cx: 145, cy: 160, val: "₹0.7L" },
          { cx: 225, cy: 158, val: "₹0.9L" },
          { cx: 305, cy: 140, val: "₹1.5L" },
          { cx: 385, cy: 120, val: "₹2.1L" },
          { cx: 455, cy: 135, val: "₹1.6L" }
        ],
        targetMetPct: 62,
        closedDeals: 8
      }
    };

    return dataMap[selectedBdaName] || dataMap["Vikash Kumar"];
  }, [selectedBdaName]);

  // Compute stats dynamically
  const closedQuotes = quotes.filter(q => q.status === "Client_Accepted");
  const myClosedQuotes = closedQuotes.filter(q => q.bda === user.name);
  
  const totalRevenue = closedQuotes.reduce((sum, q) => sum + (q.totalPrice || 0), 0);
  const myRevenue = myClosedQuotes.reduce((sum, q) => sum + (q.totalPrice || 0), 0);

  // Fallback to initial values to ensure initial dashboard looks loaded
  const displayRevenue = totalRevenue > 0 ? totalRevenue : 2845000;
  const displayMyRevenue = myRevenue > 0 ? myRevenue : 892000;

  const activeLeadsCount = isManager 
    ? leads.length 
    : leads.filter(l => l.assignedBDA?.name === user.name).length;
  
  const displayActiveLeads = activeLeadsCount > 0 ? activeLeadsCount : (isManager ? 142 : 37);

  // Compute conversion rate
  const totalQuotes = quotes.length;
  const acceptedQuotesCount = quotes.filter(q => q.status === "Client_Accepted").length;
  const teamConversionRate = totalQuotes > 0 ? ((acceptedQuotesCount / totalQuotes) * 100).toFixed(1) : "68.4";
  
  const myTotalQuotesCount = quotes.filter(q => q.bda === user.name).length;
  const myAcceptedQuotesCount = quotes.filter(q => q.bda === user.name && q.status === "Client_Accepted").length;
  const myConversionRate = myTotalQuotesCount > 0 ? ((myAcceptedQuotesCount / myTotalQuotesCount) * 100).toFixed(1) : "72.1";

  const conversionVal = isManager ? `${teamConversionRate}%` : `${myConversionRate}%`;

  // Compute pending tasks
  const myLeads = leads.filter(l => l.assignedBDA?.name === user.name);
  const pendingTasksCount = myLeads.reduce((sum, lead) => {
    const incomplete = lead.tasks?.filter(t => !t.completed) || [];
    return sum + incomplete.length;
  }, 0);
  const displayPendingTasks = pendingTasksCount > 0 ? pendingTasksCount : 3;

  // Build stats array
  const stats = [
    { 
      label: isManager ? "Team Revenue (May)" : "My Closed Deals", 
      value: `₹${(isManager ? displayRevenue : displayMyRevenue).toLocaleString("en-IN")}`, 
      change: "+12.4%", 
      desc: isManager ? "vs ₹30L Target" : "vs ₹10L Target",
      icon: TrendingUp,
      color: "success"
    },
    { 
      label: isManager ? "Active Managed Leads" : "My Active Leads", 
      value: displayActiveLeads.toString(), 
      change: "+8.2%", 
      desc: "In active B2B pipelines",
      icon: Users,
      color: "info"
    },
    { 
      label: "Quote Conversion Rate", 
      value: conversionVal, 
      change: "+2.1%", 
      desc: "Accepted vs Sent Ratio",
      icon: FileCheck,
      color: "warning"
    },
    { 
      label: "Avg SLA Response", 
      value: isManager ? "4.2 Hours" : "3.1 Hours", 
      change: "-18%", 
      desc: "Fast inquiry assignment",
      icon: Clock,
      color: "error"
    }
  ];

  // Dynamic Activity Stream compiled from actual Lead logs & Quote history
  const getDynamicActivities = () => {
    const list = [];
    
    // Process lead logs
    leads.forEach(l => {
      if (l.logs) {
        l.logs.forEach(log => {
          list.push({
            id: `act_lead_${log.id || Math.random()}`,
            user: l.assignedBDA?.name || "System",
            action: `logged ${log.type.toLowerCase()} activity - "${log.subject}"`,
            target: l.companyName,
            time: log.date || "Recently",
            timestamp: new Date(log.date || Date.now()).getTime()
          });
        });
      }
    });

    // Process quote history
    quotes.forEach(q => {
      if (q.history) {
        q.history.forEach(hist => {
          list.push({
            id: `act_quote_${q._id}_${hist.revision}`,
            user: hist.revisedBy || "System",
            action: `registered quote version v${hist.revision} (${hist.reason})`,
            target: q.customer,
            time: hist.revisedAt || "Recently",
            timestamp: new Date(hist.revisedAt || Date.now()).getTime()
          });
        });
      }
    });

    // Sort by timestamp desc
    list.sort((a, b) => b.timestamp - a.timestamp);

    // Fallback defaults if empty
    const mockActivities = [
      { id: 1, user: "Vikash Kumar", action: "revised quotation #QT-2026-081", target: "Tata Motors Ltd", time: "20 mins ago" },
      { id: 2, user: "Vikash Kumar", action: "promoted lead stage to Negotiating", target: "L&T Heavy Engineering", time: "2 hours ago" },
      { id: 3, user: "Rahul Sharma", action: "logged a site survey visit", target: "Adani Power Corp", time: "4 hours ago" },
      { id: 4, user: "System", action: "auto-qualified inbound website RFQ", target: "Reliance Defence Ltd", time: "1 day ago" }
    ];

    return list.length > 0 ? list.slice(0, 5) : mockActivities;
  };

  const activities = getDynamicActivities();

  // Dynamic BDA achievements list for Manager view leaderboard
  const compileBdaRankings = (empName, targetVal, baseAchieved, defaultConv) => {
    const empQuotes = quotes.filter(q => q.bda === empName);
    const wonRevenue = empQuotes
      .filter(q => q.status === "Client_Accepted")
      .reduce((sum, q) => sum + (q.totalPrice || 0), 0);
    
    const finalAchieved = wonRevenue > 0 ? wonRevenue : baseAchieved;
    
    const totalQ = empQuotes.length;
    const wonQ = empQuotes.filter(q => q.status === "Client_Accepted").length;
    const convRate = totalQ > 0 ? `${Math.round((wonQ / totalQ) * 100)}%` : defaultConv;

    const targetPct = (finalAchieved / 1000000) * 100;
    let status = "On Track";
    if (targetPct >= 110) status = "Exceeded";
    else if (targetPct < 70) status = "Needs Action";

    return { name: empName, target: `₹${(targetVal/100000).toFixed(0)}L`, achieved: `₹${finalAchieved.toLocaleString("en-IN")}`, conversion: convRate, status, numAchieved: finalAchieved };
  };

  const bdas = [
    compileBdaRankings("Pooja Patel", 1000000, 1329000, "81.2%"),
    compileBdaRankings("Vikash Kumar", 1000000, 892000, "72.1%"),
    compileBdaRankings("Rahul Sharma", 1000000, 624000, "64.8%")
  ].sort((a, b) => b.numAchieved - a.numAchieved);

  // Compile actual dynamic action items from leads checklist
  const getDynamicTasks = () => {
    const list = [];
    myLeads.forEach(lead => {
      if (lead.tasks) {
        lead.tasks.forEach(task => {
          if (!task.completed) {
            list.push({
              id: task.id,
              label: task.label,
              companyName: lead.companyName,
              leadScore: lead.leadScore
            });
          }
        });
      }
    });

    const mockTasks = [
      { id: "m_t_1", label: "Prepare Revised Quote", companyName: "Tata Motors Defence Division", leadScore: 90 },
      { id: "m_t_2", label: "Call Procurement Manager", companyName: "L&T Heavy Engineering", leadScore: 75 },
      { id: "m_t_3", label: "Schedule Site Visit Survey", companyName: "Adani Power Corp", leadScore: 50 }
    ];

    return list.length > 0 ? list.slice(0, 3) : mockTasks;
  };

  const dynamicTasks = getDynamicTasks();

  return (
    <div className="dashboard-view fade-in">
      {/* Top Banner */}
      <div className="welcome-banner glass-panel">
        <div className="banner-text">
          <h2>Welcome back, {user.name}</h2>
          <p>
            {isManager 
              ? "You are monitoring the BDA Team dashboard. Direct reports are fully synchronized." 
              : "Your pipelines are up to date. You have 3 pending follow-up tasks due today."}
          </p>
        </div>
        <div className="banner-role-tag badge banner-role-tag">{user.role.replace("_", " ")}</div>
      </div>

      {/* Grid Stats */}
      <div className="stats-grid">
        {stats.map((stat, idx) => {
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
              <div className="stat-card-footer">
                <span className={`stat-change text-${stat.color}`}>{stat.change}</span>
                <span className="stat-desc">{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="dashboard-content-grid">
        
        {/* Core Line Chart representing single BDA monthly performance */}
        <div className="chart-card glass-panel card-lift">
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>BDA Monthly Performance</h3>
              <span className="header-meta">Monthly quote conversions (in Lakhs ₹)</span>
            </div>
            
            <div className="control-filter" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select 
                value={selectedBdaName} 
                onChange={(e) => setSelectedBdaName(e.target.value)}
                className="filter-select"
                style={{
                  height: "32px",
                  padding: "0 8px",
                  fontSize: "12px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                <option value="Pooja Patel">Pooja Patel (Senior BDA)</option>
                <option value="Vikash Kumar">Vikash Kumar (BDA Agent)</option>
                <option value="Rahul Sharma">Rahul Sharma (Junior BDA)</option>
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            <svg viewBox="0 0 500 220" className="svg-chart">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.04)" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.04)" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.04)" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.04)" />
              
              {/* X/Y Axis Labels */}
              <text x="15" y="25" fill="var(--text-muted)" fontSize="9">₹5.0L</text>
              <text x="15" y="75" fill="var(--text-muted)" fontSize="9">₹3.0L</text>
              <text x="15" y="125" fill="var(--text-muted)" fontSize="9">₹1.5L</text>
              <text x="20" y="175" fill="var(--text-muted)" fontSize="9">0</text>
              
              <text x="65" y="195" fill="var(--text-muted)" fontSize="9">Jan</text>
              <text x="145" y="195" fill="var(--text-muted)" fontSize="9">Feb</text>
              <text x="225" y="195" fill="var(--text-muted)" fontSize="9">Mar</text>
              <text x="305" y="195" fill="var(--text-muted)" fontSize="9">Apr</text>
              <text x="385" y="195" fill="var(--text-muted)" fontSize="9">May</text>
              <text x="455" y="195" fill="var(--text-muted)" fontSize="9">Jun</text>

              {/* Area Gradient */}
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              <path 
                d={bdaMonthlyData.areaGlow} 
                fill="url(#chartGlow)"
              />

              <path 
                d={bdaMonthlyData.points} 
                fill="none" 
                stroke="var(--accent)" 
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Node Points */}
              {bdaMonthlyData.circles.map((c, i) => (
                <g key={i} className="chart-node-g">
                  <circle cx={c.cx} cy={c.cy} r="4" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="1.8" />
                  <text x={c.cx} y={c.cy - 8} fill="var(--text-muted)" fontSize="8" textAnchor="middle" fontWeight="600">{c.val}</text>
                </g>
              ))}
            </svg>
          </div>
          
          {/* Dynamic micro-summary summary details */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-around", 
            padding: "10px 14px", 
            borderTop: "1px solid var(--border-color)", 
            background: "rgba(255,255,255,0.01)", 
            fontSize: "11px", 
            color: "var(--text-secondary)", 
            borderBottomLeftRadius: "8px", 
            borderBottomRightRadius: "8px" 
          }}>
            <span>Role: <strong style={{ color: "var(--text-primary)" }}>{bdaMonthlyData.role}</strong></span>
            <span>Target met: <strong style={{ color: "var(--color-success)" }}>{bdaMonthlyData.targetMetPct}%</strong></span>
            <span>May conversions: <strong style={{ color: "var(--accent-light)" }}>{bdaMonthlyData.circles[4].val}</strong></span>
            <span>Closed Deals: <strong style={{ color: "var(--text-primary)" }}>{bdaMonthlyData.closedDeals} qty</strong></span>
          </div>
        </div>

        {/* Secondary Donut/Pie Chart for Lead Sources (Newly added Graph!) */}
        <div className="chart-card glass-panel card-lift">
          <div className="card-header">
            <h3>B2B Lead Intake Sources</h3>
            <span className="header-meta">Lead origination percentages</span>
          </div>
          <div className="donut-chart-wrapper">
            <svg viewBox="0 0 200 200" className="donut-svg">
              <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="20" />
              
              {/* Direct RFQ (35%) */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--accent)" strokeWidth="20" 
                      strokeDasharray="153.9 439.8" strokeDashoffset="0" />
              
              {/* Website Inbound (25%) */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-success)" strokeWidth="20" 
                      strokeDasharray="109.9 439.8" strokeDashoffset="-153.9" />
              
              {/* Trade Shows (20%) */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-info)" strokeWidth="20" 
                      strokeDasharray="88 439.8" strokeDashoffset="-263.8" />
              
              {/* Cold Outreach (20%) */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-warning)" strokeWidth="20" 
                      strokeDasharray="88 439.8" strokeDashoffset="-351.8" />
            </svg>
            <div className="donut-legends">
              <div className="legend-item"><span className="legend-dot dot-accent"></span><span>Direct RFQ (35%)</span></div>
              <div className="legend-item"><span className="legend-dot dot-success"></span><span>Website (25%)</span></div>
              <div className="legend-item"><span className="legend-dot dot-info"></span><span>Trade Shows (20%)</span></div>
              <div className="legend-item"><span className="legend-dot dot-warning"></span><span>Outreach (20%)</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* Leaderboard or Tasks */}
      <div className="dashboard-content-grid">
        
        {isManager ? (
          <div className="leaderboard-card glass-panel card-lift">
            <div className="card-header">
              <h3>BDA Team Standings</h3>
              <span className="header-meta">Performance against monthly targets (in Rupees)</span>
            </div>
            <div className="leaderboard-list">
              {bdas.map((bda, idx) => (
                <div key={idx} className="bda-row">
                  <div className="bda-info-block">
                    <span className="bda-name">{bda.name}</span>
                    <span className="bda-conversion">Conv. Rate: {bda.conversion}</span>
                  </div>
                  <div className="bda-progress-area">
                    <div className="progress-labels">
                      <span>{bda.achieved} Achieved</span>
                      <span>Target: {bda.target}</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div 
                        className={`progress-fill ${bda.status === "Exceeded" ? "progress-gold" : bda.status === "Needs Action" ? "progress-alert" : ""}`}
                        style={{ width: `${Math.min(100, (parseFloat(bda.achieved.replace(/[₹,]/g, '')) / 100000) * 10)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`bda-status-badge badge ${bda.status === "Exceeded" ? "badge-success" : bda.status === "Needs Action" ? "badge-error" : "badge-info"}`}>
                    {bda.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="tasks-summary-card glass-panel card-lift">
            <div className="card-header">
              <h3>Follow-up Action Tasks</h3>
              <span className="header-meta">High priority actions due today</span>
            </div>
            <div className="dashboard-tasks-list">
              {dynamicTasks.map((t) => (
                <div key={t.id} className="dash-task-item">
                  <div className={`task-priority-indicator ${t.leadScore >= 80 ? "urgent" : t.leadScore >= 50 ? "high" : "medium"}`} />
                  <div className="task-text">
                    <strong>{t.label}</strong>
                    <span>{t.companyName}</span>
                  </div>
                  <span className={`task-deadline badge ${t.leadScore >= 80 ? "badge-error" : t.leadScore >= 50 ? "badge-warning" : "badge-muted"}`}>
                    {t.leadScore >= 80 ? "Hot Lead" : "Pending"}
                  </span>
                </div>
              ))}
              {dynamicTasks.length === 0 && (
                <div className="dashboard-tasks-empty-notice">Zero pending checklist tasks! Your pipelines are clean.</div>
              )}
            </div>
          </div>
        )}

        {/* Activity Logs Feed */}
        <div className="activity-card glass-panel card-lift">
          <div className="card-header">
            <h3>Real-time Activity Stream</h3>
            <span className="header-meta">Recent actions inside ForgeCRM workspace</span>
          </div>
          <div className="activity-feed-list">
            {activities.map((act) => (
              <div key={act.id} className="activity-feed-item">
                <div className="feed-avatar-wrap">
                  <div className="feed-indicator-dot" />
                </div>
                <div className="feed-text-area">
                  <p>
                    <strong>{act.user}</strong> {act.action} for <strong>{act.target}</strong>
                  </p>
                  <span className="feed-timestamp">{act.time}</span>
                </div>
                <ChevronRight size={14} className="feed-arrow-icon" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
