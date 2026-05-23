import React from "react";
import { 
  Award, 
  Target, 
  TrendingUp, 
  PhoneCall, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  Percent,
  Users,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import "./Performance.css";

export default function Performance({ user }) {
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

  // Dynamically compile employee stats based on lead logs and quotes
  const compileEmployeeStats = (empName, defaultStats) => {
    const empQuotes = quotes.filter(q => q.bda === empName);
    const empLeads = leads.filter(l => l.assignedBDA?.name === empName);

    // Achieved revenue from accepted quotes
    const wonRevenue = empQuotes
      .filter(q => q.status === "Client_Accepted")
      .reduce((sum, q) => sum + (q.totalPrice || 0), 0);
    
    // Outbound communications calculated from lead logs
    let calls = 0;
    let emails = 0;
    let meetings = 0;
    let siteVisits = 0;

    empLeads.forEach(l => {
      if (l.logs) {
        l.logs.forEach(log => {
          if (log.type === "Call") calls++;
          else if (log.type === "Email") emails++;
          else if (log.type === "Meeting") meetings++;
          else if (log.type === "Site Visit") siteVisits++;
        });
      }
    });

    // Conversion rate based on quotes
    const totalQ = empQuotes.length;
    const wonQ = empQuotes.filter(q => q.status === "Client_Accepted").length;
    const convRate = totalQ > 0 ? Math.round((wonQ / totalQ) * 100) : defaultStats.conversionRate;

    // We merge these with the base offsets so that the initial graphs and targets look fully loaded
    const finalAchieved = wonRevenue > 0 ? wonRevenue : defaultStats.revenueAchieved;
    const finalCalls = calls > 0 ? defaultStats.callsMade + calls : defaultStats.callsMade;
    const finalEmails = emails > 0 ? defaultStats.emailsSent + emails : defaultStats.emailsSent;
    const finalMeetings = meetings > 0 ? defaultStats.meetingsDone + meetings : defaultStats.meetingsDone;
    const finalSiteVisits = siteVisits > 0 ? defaultStats.siteVisitsDone + siteVisits : defaultStats.siteVisitsDone;

    const targetPct = Math.round((finalAchieved / defaultStats.revenueTarget) * 100);
    let status = "On Track";
    if (targetPct >= 110) status = "Exceeded";
    else if (targetPct < 70) status = "Needs Action";

    return {
      ...defaultStats,
      revenueAchieved: finalAchieved,
      callsMade: finalCalls,
      emailsSent: finalEmails,
      meetingsDone: finalMeetings,
      siteVisitsDone: finalSiteVisits,
      conversionRate: convRate,
      status
    };
  };

  const employeesDb = [
    compileEmployeeStats("Pooja Patel", {
      id: "bda_1",
      name: "Pooja Patel",
      role: "Senior BDA",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      revenueTarget: 1000000,
      revenueAchieved: 1329000,
      callsMade: 310,
      emailsSent: 245,
      meetingsDone: 19,
      siteVisitsDone: 8,
      avgResponseHours: 2.4,
      conversionRate: 81.2,
      status: "Exceeded"
    }),
    compileEmployeeStats("Vikash Kumar", {
      id: "bda_2",
      name: "Vikash Kumar",
      role: "BDA Sales Agent",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      revenueTarget: 1000000,
      revenueAchieved: 892000,
      callsMade: 242,
      emailsSent: 184,
      meetingsDone: 14,
      siteVisitsDone: 6,
      avgResponseHours: 3.1,
      conversionRate: 72.1,
      status: "On Track"
    }),
    compileEmployeeStats("Rahul Sharma", {
      id: "bda_3",
      name: "Rahul Sharma",
      role: "Junior BDA",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      revenueTarget: 1000000,
      revenueAchieved: 624000,
      callsMade: 195,
      emailsSent: 120,
      meetingsDone: 8,
      siteVisitsDone: 3,
      avgResponseHours: 4.8,
      conversionRate: 64.8,
      status: "Needs Action"
    })
  ];

  // Set default selected employee for manager inspector
  const [selectedBdaId, setSelectedBdaId] = React.useState("bda_2");
  const selectedBda = employeesDb.find(e => e.id === selectedBdaId) || employeesDb[1];

  // Individual BDA data (defaults to Vikash)
  const myData = employeesDb[1];
  const myPercentage = Math.round((myData.revenueAchieved / myData.revenueTarget) * 100);

  // Aggregated Team Metrics for Manager View
  const teamTotalTarget = employeesDb.reduce((sum, e) => sum + e.revenueTarget, 0);
  const teamTotalAchieved = employeesDb.reduce((sum, e) => sum + e.revenueAchieved, 0);
  const teamPercentage = Math.round((teamTotalAchieved / teamTotalTarget) * 100);

  // Dynamic Leaderboard Sorting: Priority computed by Revenue met, Conversion Rate, and SLAs
  const sortedBDAs = React.useMemo(() => {
    return [...employeesDb].sort((a, b) => {
      const scoreA = Math.round(((a.revenueAchieved / a.revenueTarget) * 100 * 0.5) + (a.conversionRate * 0.3) + ((8 - a.avgResponseHours) * 10 * 0.2));
      const scoreB = Math.round(((b.revenueAchieved / b.revenueTarget) * 100 * 0.5) + (b.conversionRate * 0.3) + ((8 - b.avgResponseHours) * 10 * 0.2));
      return scoreB - scoreA;
    });
  }, [leads, quotes]);

  const getBdaExtraStats = (name) => {
    if (name.includes("Pooja")) {
      return {
        medal: "🥇",
        shift: 0,
        shiftColor: "muted",
        growth: 15.6,
        sparkPath: "M 2,16 C 15,10 30,5 58,2"
      };
    } else if (name.includes("Vikash")) {
      return {
        medal: "🥈",
        shift: 1,
        shiftColor: "success",
        growth: 25.6,
        sparkPath: "M 2,18 C 15,18 30,12 58,2"
      };
    } else {
      return {
        medal: "🥉",
        shift: -1,
        shiftColor: "error",
        growth: -20.0,
        sparkPath: "M 2,4 C 15,4 30,12 58,22"
      };
    }
  };

  return (
    <div className="performance-view fade-in">
      
      {/* 1. Header Banner */}
      <div className="performance-header glass-panel">
        <div className="header-text-block">
          {isManager ? <ShieldCheck className="award-icon" size={32} /> : <UserCheck className="award-icon" size={32} />}
          <div>
            <h3>{isManager ? "Team Management Performance Board" : "My Sales Performance Matrix"}</h3>
            <p>
              {isManager 
                ? "Directly monitor employee metrics, quota achievements, outreach capacities, and SLAs." 
                : "Real-time evaluation metrics, SLA response tracking, and regional standings."}
            </p>
          </div>
        </div>
        <div className="period-badge badge badge-info">Fiscal Period: May 2026</div>
      </div>

      {/* 2. DUAL ROLE ROUTING SHEETS */}
      {isManager ? (
        /* MANAGER VIEW: Employee Performance Inspector Board */
        <div className="manager-dashboard-layout fade-in">
          
          {/* Team Summary Row */}
          <div className="team-summary-row glass-panel card-lift">
            <div className="summary-text">
              <h4>Aggregate Sales Division Quota</h4>
              <h2>₹{teamTotalAchieved.toLocaleString("en-IN")}.00 <small>Achieved</small></h2>
              <p>Combined target of 3 managed associates: <strong>₹{teamTotalTarget.toLocaleString("en-IN")}</strong></p>
            </div>
            
            <div className="summary-progress-section">
              <div className="progress-label-wrap">
                <span>Team Target Completion Rate</span>
                <strong>{teamPercentage}%</strong>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-fill progress-gold" style={{ width: `${teamPercentage}%` }} />
              </div>
            </div>
          </div>

          {/* Drill-down Split-Pane Selector */}
          <div className="manager-split-grid">
            
            {/* Left Pane: Employee Selector Cards */}
            <div className="employee-select-list">
              <h5 className="pane-heading">Managed Associates ({employeesDb.length})</h5>
              <div className="employee-cards-wrap">
                {employeesDb.map((emp) => {
                  const isActive = selectedBdaId === emp.id;
                  const pct = Math.round((emp.revenueAchieved / emp.revenueTarget) * 100);
                  return (
                    <div 
                      key={emp.id} 
                      className={`employee-select-card glass-panel card-lift ${isActive ? "active-border active-pulse" : ""}`}
                      onClick={() => setSelectedBdaId(emp.id)}
                    >
                      <img src={emp.avatar} alt={emp.name} className="emp-card-avatar" />
                      <div className="emp-card-details">
                        <div className="emp-card-title-row">
                          <strong>{emp.name}</strong>
                          <span className={`badge ${
                            emp.status === "Exceeded" ? "badge-success" : 
                            emp.status === "On Track" ? "badge-info" : 
                            "badge-error"
                          }`}>{emp.status}</span>
                        </div>
                        <span className="emp-card-role">{emp.role}</span>
                        
                        <div className="emp-card-achievement">
                          <span>Target Met: <strong>{pct}%</strong></span>
                          <span>₹{emp.revenueAchieved.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Selected Employee Detailed Inspector */}
            <div className="employee-details-inspector glass-panel fade-in">
              <div className="inspector-header">
                <img src={selectedBda.avatar} alt={selectedBda.name} className="inspector-avatar" />
                <div className="inspector-profile-block">
                  <span className="badge badge-info">{selectedBda.role}</span>
                  <h3>{selectedBda.name}</h3>
                  <p>Detailed performance analytics review for active fiscal month.</p>
                </div>
              </div>

              {/* Inspector Content Subgrid */}
              <div className="inspector-content-subgrid">
                
                {/* Specific Target gauge */}
                <div className="gauge-card glass-panel">
                  <h4>Target Completion</h4>
                  <div className="gauge-wrapper">
                    <svg viewBox="0 0 120 120" className="gauge-svg">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        fill="none" 
                        stroke="var(--accent-gradient)" 
                        strokeWidth="8" 
                        strokeDasharray="314.16" 
                        strokeDashoffset={314.16 - (314.16 * Math.round((selectedBda.revenueAchieved / selectedBda.revenueTarget) * 100)) / 100}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="gauge-labels-center">
                      <span className="gauge-percent text-gradient">
                        {Math.round((selectedBda.revenueAchieved / selectedBda.revenueTarget) * 100)}%
                      </span>
                      <span className="gauge-label-text">Done</span>
                    </div>
                  </div>
                  <div className="gauge-details">
                    <div className="gauge-row">
                      <span>Quota</span>
                      <strong>₹{selectedBda.revenueTarget.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="gauge-row">
                      <span>Achieved</span>
                      <strong className="text-success">₹{selectedBda.revenueAchieved.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>

                {/* Specific Outreach Metrics grid */}
                <div className="metrics-subgrid">
                  
                  <div className="metric-box glass-panel">
                    <div className="box-header">
                      <PhoneCall size={16} className="box-icon icon-info" />
                      <span>Calls Logged</span>
                    </div>
                    <div className="box-value">{selectedBda.callsMade}</div>
                    <span className="box-meta">Outbound customer dials</span>
                  </div>

                  <div className="metric-box glass-panel">
                    <div className="box-header">
                      <Mail size={16} className="box-icon icon-success" />
                      <span>Emails Sent</span>
                    </div>
                    <div className="box-value">{selectedBda.emailsSent}</div>
                    <span className="box-meta">Quotes & technical specifications</span>
                  </div>

                  <div className="metric-box glass-panel">
                    <div className="box-header">
                      <Calendar size={16} className="box-icon icon-warning" />
                      <span>Meetings Done</span>
                    </div>
                    <div className="box-value">{selectedBda.meetingsDone}</div>
                    <span className="box-meta">Procurement negotiations</span>
                  </div>

                  <div className="metric-box glass-panel">
                    <div className="box-header">
                      <MapPin size={16} className="box-icon icon-error" />
                      <span>Site Visits</span>
                    </div>
                    <div className="box-value">{selectedBda.siteVisitsDone}</div>
                    <span className="box-meta">Drawing layout audits</span>
                  </div>

                  <div className="metric-box glass-panel">
                    <div className="box-header">
                      <Clock size={16} className="box-icon icon-info" />
                      <span>Avg SLA Speed</span>
                    </div>
                    <div className="box-value">{selectedBda.avgResponseHours}h</div>
                    <span className="box-meta">Customer inquiry handling</span>
                  </div>

                  <div className="metric-box glass-panel">
                    <div className="box-header">
                      <Percent size={16} className="box-icon icon-success" />
                      <span>Deal Conversion</span>
                    </div>
                    <div className="box-value">{selectedBda.conversionRate}%</div>
                    <span className="box-meta">Accepted quotations ratio</span>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Prioritized Sales Performance Leaderboard with MoM comparisons */}
          <div className="standings-card glass-panel card-lift" style={{ marginTop: "16px" }}>
            <div className="standings-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award size={16} style={{ color: "var(--accent-light)" }} /> BDA Sales Performance Leaderboard
                </h3>
                <p>Prioritized dynamically by active quote conversions, Outreach activity volume, and SLAs</p>
              </div>
              <span className="badge badge-info" style={{ fontSize: "10px" }}>May 2026 Fiscal Month</span>
            </div>

            <div className="standings-header-row">
              <span>Rank</span>
              <span>MoM Shift</span>
              <span>Business Development Associate</span>
              <span>Overall Score</span>
              <span>Monthly Growth</span>
              <span>Target Completion</span>
              <span>Performance Trend</span>
              <span style={{ textAlign: "right" }}>May Revenue</span>
            </div>

            <div className="standings-list">
              {sortedBDAs.map((rep, idx) => {
                const isMe = rep.name.includes(user.name);
                const extra = getBdaExtraStats(rep.name);
                const targetPct = Math.min(100, Math.round((rep.revenueAchieved / rep.revenueTarget) * 100));
                const overallScore = Math.round((targetPct * 0.5) + (rep.conversionRate * 0.3) + ((8 - rep.avgResponseHours) * 10 * 0.2));

                return (
                  <div key={rep.id} className={`standing-row ${isMe ? "me-row active-pulse" : ""}`}>
                    <div className="standing-rank-badge">
                      <span style={{ fontSize: "14px" }}>{extra.medal}</span>
                      <strong>#{idx + 1}</strong>
                    </div>

                    <div className={`standing-shift-badge ${extra.shiftColor}`}>
                      {extra.shift > 0 ? "▲" : extra.shift < 0 ? "▼" : "▬"} 
                      <span style={{ fontSize: "10px", marginLeft: "2px" }}>{extra.shift !== 0 ? Math.abs(extra.shift) : ""}</span>
                    </div>

                    <div className="standing-profile-block">
                      <img src={rep.avatar} alt={rep.name} className="standing-profile-avatar" />
                      <div className="standing-profile-info">
                        <strong>{rep.name} {isMe && "(You)"}</strong>
                        <span>{rep.role}</span>
                      </div>
                    </div>

                    <div>
                      <span className="standing-score-badge">{overallScore} pts</span>
                    </div>

                    <div className="standing-growth-block">
                      <strong style={{ color: extra.growth >= 0 ? "var(--color-success)" : "var(--color-error)" }}>
                        {extra.growth >= 0 ? "+" : ""}{extra.growth}%
                      </strong>
                      <span>vs April</span>
                    </div>

                    <div className="standing-progress-block">
                      <div className="standing-progress-label">
                        <span>{Math.round((rep.revenueAchieved / rep.revenueTarget) * 100)}% met</span>
                      </div>
                      <div className="standing-progress-bar-wrap">
                        <div 
                          className="standing-progress-bar-fill" 
                          style={{ 
                            width: `${targetPct}%`,
                            background: rep.status === "Exceeded" ? "var(--accent-gradient)" : "var(--color-success)" 
                          }} 
                        />
                      </div>
                    </div>

                    <div>
                      <svg width="60" height="24" className="standing-trend-svg">
                        <path 
                          d={extra.sparkPath}
                          fill="none"
                          stroke={rep.status === "Exceeded" ? "var(--color-success)" : rep.status === "On Track" ? "var(--accent-light)" : "var(--color-error)"}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="standing-revenue-block">
                      <strong>₹{rep.revenueAchieved.toLocaleString("en-IN")}</strong>
                      <span>Target: ₹{rep.revenueTarget.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* SALESPERSON VIEW: Personal metrics & Rankings */
        <div className="personal-dashboard-layout fade-in">
          
          <div className="performance-main-grid">
            
            {/* Target gauge */}
            <div className="gauge-card glass-panel card-lift">
              <h4>Target Achievement Progress</h4>
              <div className="gauge-wrapper">
                <svg viewBox="0 0 120 120" className="gauge-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke="var(--accent-gradient)" 
                    strokeWidth="10" 
                    strokeDasharray="314.16" 
                    strokeDashoffset={314.16 - (314.16 * myPercentage) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="gauge-labels-center">
                  <span className="gauge-percent text-gradient">{myPercentage}%</span>
                  <span className="gauge-label-text">Achieved</span>
                </div>
              </div>
              <div className="gauge-details">
                <div className="gauge-row">
                  <span>Target Quota</span>
                  <strong>₹{myData.revenueTarget.toLocaleString("en-IN")}</strong>
                </div>
                <div className="gauge-row">
                  <span>Achieved So Far</span>
                  <strong className="text-success">₹{myData.revenueAchieved.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="metrics-subgrid">
              
              <div className="metric-box glass-panel card-lift">
                <div className="box-header">
                  <PhoneCall size={18} className="box-icon icon-info" />
                  <span>Outreach Calls</span>
                </div>
                <div className="box-value">{myData.callsMade}</div>
                <span className="box-meta">Target: 250 calls/month</span>
              </div>

              <div className="metric-box glass-panel card-lift">
                <div className="box-header">
                  <Mail size={18} className="box-icon icon-success" />
                  <span>Emails Sent</span>
                </div>
                <div className="box-value">{myData.emailsSent}</div>
                <span className="box-meta">Follow-ups & proposals</span>
              </div>

              <div className="metric-box glass-panel card-lift">
                <div className="box-header">
                  <Calendar size={18} className="box-icon icon-warning" />
                  <span>Meetings Logged</span>
                </div>
                <div className="box-value">{myData.meetingsDone}</div>
                <span className="box-meta">Technical alignment checks</span>
              </div>

              <div className="metric-box glass-panel card-lift">
                <div className="box-header">
                  <MapPin size={18} className="box-icon icon-error" />
                  <span>Site Surveys</span>
                </div>
                <div className="box-value">{myData.siteVisitsDone}</div>
                <span className="box-meta">Anchor bolt layout audits</span>
              </div>

              <div className="metric-box glass-panel card-lift">
                <div className="box-header">
                  <Clock size={18} className="box-icon icon-info" />
                  <span>Avg SLA Response</span>
                </div>
                <div className="box-value">{myData.avgResponseHours}h</div>
                <span className="box-meta">Inbound request assignment</span>
              </div>

              <div className="metric-box glass-panel card-lift">
                <div className="box-header">
                  <Percent size={18} className="box-icon icon-success" />
                  <span>Pipeline Conversion</span>
                </div>
                <div className="box-value">{myData.conversionRate}%</div>
                <span className="box-meta">Won vs Lost ratio</span>
              </div>

            </div>

          </div>

          {/* Prioritized Sales Performance Leaderboard with MoM comparisons */}
          <div className="standings-card glass-panel card-lift" style={{ marginTop: "16px" }}>
            <div className="standings-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award size={16} style={{ color: "var(--accent-light)" }} /> BDA Sales Performance Leaderboard
                </h3>
                <p>Prioritized dynamically by active quote conversions, Outreach activity volume, and SLAs</p>
              </div>
              <span className="badge badge-info" style={{ fontSize: "10px" }}>May 2026 Fiscal Month</span>
            </div>

            <div className="standings-header-row">
              <span>Rank</span>
              <span>MoM Shift</span>
              <span>Business Development Associate</span>
              <span>Overall Score</span>
              <span>Monthly Growth</span>
              <span>Target Completion</span>
              <span>Performance Trend</span>
              <span style={{ textAlign: "right" }}>May Revenue</span>
            </div>

            <div className="standings-list">
              {sortedBDAs.map((rep, idx) => {
                const isMe = rep.name.includes(user.name);
                const extra = getBdaExtraStats(rep.name);
                const targetPct = Math.min(100, Math.round((rep.revenueAchieved / rep.revenueTarget) * 100));
                const overallScore = Math.round((targetPct * 0.5) + (rep.conversionRate * 0.3) + ((8 - rep.avgResponseHours) * 10 * 0.2));

                return (
                  <div key={rep.id} className={`standing-row ${isMe ? "me-row active-pulse" : ""}`}>
                    <div className="standing-rank-badge">
                      <span style={{ fontSize: "14px" }}>{extra.medal}</span>
                      <strong>#{idx + 1}</strong>
                    </div>

                    <div className={`standing-shift-badge ${extra.shiftColor}`}>
                      {extra.shift > 0 ? "▲" : extra.shift < 0 ? "▼" : "▬"} 
                      <span style={{ fontSize: "10px", marginLeft: "2px" }}>{extra.shift !== 0 ? Math.abs(extra.shift) : ""}</span>
                    </div>

                    <div className="standing-profile-block">
                      <img src={rep.avatar} alt={rep.name} className="standing-profile-avatar" />
                      <div className="standing-profile-info">
                        <strong>{rep.name} {isMe && "(You)"}</strong>
                        <span>{rep.role}</span>
                      </div>
                    </div>

                    <div>
                      <span className="standing-score-badge">{overallScore} pts</span>
                    </div>

                    <div className="standing-growth-block">
                      <strong style={{ color: extra.growth >= 0 ? "var(--color-success)" : "var(--color-error)" }}>
                        {extra.growth >= 0 ? "+" : ""}{extra.growth}%
                      </strong>
                      <span>vs April</span>
                    </div>

                    <div className="standing-progress-block">
                      <div className="standing-progress-label">
                        <span>{Math.round((rep.revenueAchieved / rep.revenueTarget) * 100)}% met</span>
                      </div>
                      <div className="standing-progress-bar-wrap">
                        <div 
                          className="standing-progress-bar-fill" 
                          style={{ 
                            width: `${targetPct}%`,
                            background: rep.status === "Exceeded" ? "var(--accent-gradient)" : "var(--color-success)" 
                          }} 
                        />
                      </div>
                    </div>

                    <div>
                      <svg width="60" height="24" className="standing-trend-svg">
                        <path 
                          d={extra.sparkPath}
                          fill="none"
                          stroke={rep.status === "Exceeded" ? "var(--color-success)" : rep.status === "On Track" ? "var(--accent-light)" : "var(--color-error)"}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="standing-revenue-block">
                      <strong>₹{rep.revenueAchieved.toLocaleString("en-IN")}</strong>
                      <span>Target: ₹{rep.revenueTarget.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
