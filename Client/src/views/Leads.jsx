import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Mail, 
  Phone, 
  Building, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  PlusCircle, 
  FileCheck, 
  Briefcase, 
  PhoneCall, 
  Users as UsersIcon, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { 
  getLeads, 
  createLead, 
  updateLead, 
  deleteLead, 
  addTask, 
  toggleTask, 
  deleteTask, 
  addLog, 
  deleteLog, 
  isLeadOffline 
} from "../services/lead.api.js";
import "./Leads.css";

export default function Leads({ user }) {
  const [leads, setLeads] = useState([]);
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All"); 
  const [expandedChecklistCardId, setExpandedChecklistCardId] = useState(null);

  // Native Drag and Drop State
  const [draggingLeadId, setDraggingLeadId] = useState(null);
  const [activeDragOverStage, setActiveDragOverStage] = useState(null);

  // New checklist task on the fly
  const [newChecklistLabel, setNewChecklistLabel] = useState("");

  // Server connection status indicator
  const [apiConnected, setApiConnected] = useState(false);

  // Premium Custom Delete Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null,
    id: null,
    extraId: null,
    message: ""
  });

  // Load leads from API with local persistence failover
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads();
        // If server data exists, load it; else use local failovers or mocks safely
        if (data && data.length > 0) {
          setLeads(data);
        } else {
          setLeads(mockLeadsData);
        }
        setApiConnected(!isLeadOffline);
      } catch (err) {
        console.error("Failed to load B2B leads, mounting offline mock set.", err);
        setLeads(mockLeadsData);
        setApiConnected(false);
      }
    };

    fetchLeads();
  }, []);

  // Mock initial leads data fallback (Fixed unclosed syntax crash)
  const mockLeadsData = [
    {
      _id: "lead_1",
      companyName: "Tata Motors Defence Division",
      industry: "Automotive",
      companySize: "500+",
      annualRevenue: 45000000, 
      address: { city: "Pune", country: "India" },
      contacts: [
        { name: "Dr. Anil Mukherji", designation: "Chief Procurement Officer", email: "anil.m@tatamotors.com", phone: "+91 22 6665 8282", isPrimary: true },
        { name: "Suresh Patil", designation: "Lead Metallurgist Engineer", email: "s.patil@tatamotors.com", phone: "+91 98 2211 4455", isPrimary: false }
      ],
      status: "Qualified",
      source: "Direct RFQ (Request for Quote)",
      assignedBDA: { name: "Vikash Kumar", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
      leadScore: 88,
      customFields: {
        preferredMaterial: "Ti-6Al-4V Grade 5",
        isoCertReq: "AS9100D Compliance",
        customTolerance: "+/- 0.005mm"
      },
      tasks: [
        { id: "t1_1", label: "Verify aerospace metallurgical certificates", completed: true },
        { id: "t1_2", label: "Submit titanium quote proposal draft", completed: false },
        { id: "t1_3", label: "Validate custom tolerances with Pune plant", completed: true }
      ],
      logs: [
        { id: "l1_1", date: "2026-05-20", type: "Meeting", subject: "Specs review", summary: "Reviewed drawings for titanium fasteners. Tolerance confirmed." },
        { id: "l1_2", date: "2026-05-18", type: "Call", subject: "Initial RFQ intake", summary: "Dr. Anil submitted direct RFQ for custom engine fasteners." }
      ]
    },
    {
      _id: "lead_2",
      companyName: "L&T Heavy Engineering",
      industry: "Heavy Machinery",
      companySize: "500+",
      annualRevenue: 120000000, 
      address: { city: "Hazira", country: "India" },
      contacts: [
        { name: "Meera Deshmukh", designation: "VP Operations", email: "meera.d@lntecc.com", phone: "+91 26 5244 1100", isPrimary: true }
      ],
      status: "Negotiating",
      source: "Trade Show",
      assignedBDA: { name: "Vikash Kumar", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
      leadScore: 92,
      customFields: {
        preferredMaterial: "AISI 4140 Alloy Steel",
        coatingReq: "Zinc Flake Coating",
        dimensions: "M24 - M64 Bolts"
      },
      tasks: [
        { id: "t2_1", label: "Conduct site survey at Hazira assembly line", completed: true },
        { id: "t2_2", label: "Establish final Zinc Flake coating thickness", completed: true },
        { id: "t2_3", label: "Approve payment terms with finance", completed: false }
      ],
      logs: [
        { id: "l2_1", date: "2026-05-21", type: "Site Visit", subject: "Hazira Plant Survey", summary: "Conducted chemical reactor anchor bolt layout review. Dimensions finalized." }
      ]
    },
    {
      _id: "lead_3",
      companyName: "Hindustan Aeronautics (HAL)",
      industry: "Aerospace",
      companySize: "500+",
      annualRevenue: 150000000, 
      address: { city: "Bengaluru", country: "India" },
      contacts: [
        { name: "Wing Cmdr. K. Rao (Retd.)", designation: "Director Aerospace Assemblies", email: "k.rao@hal-india.com", phone: "+91 80 2232 4433", isPrimary: true }
      ],
      status: "Quoted",
      source: "Partner Agent",
      assignedBDA: { name: "Vikash Kumar", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
      leadScore: 95,
      customFields: {
        preferredMaterial: "Inconel 718 Superalloy",
        testingRequired: "Ultrasonic Inspection & NDT",
        isoCertReq: "AS9100 Rev D"
      },
      tasks: [
        { id: "t4_1", label: "Acquire AS9100 Rev D checklist sheets", completed: true }
      ],
      logs: []
    }
  ];

  // Lead Creation Form states
  const [compName, setCompName] = useState("");
  const [compIndustry, setCompIndustry] = useState("Automotive");
  const [compSize, setCompSize] = useState("51-200");
  const [compRevenue, setCompRevenue] = useState("");
  const [compCity, setCompCity] = useState("");
  const [compCountry, setCompCountry] = useState("India");
  const [leadSource, setLeadSource] = useState("Direct RFQ (Request for Quote)");
  const [leadScore, setLeadScore] = useState(75);

  const [modalContacts, setModalContacts] = useState([
    { name: "", designation: "", email: "", phone: "", isPrimary: true }
  ]);
  const [modalSpecs, setModalSpecs] = useState([
    { key: "preferredMaterial", value: "" },
    { key: "customTolerance", value: "" }
  ]);

  const [formError, setFormError] = useState("");

  const addModalContactRow = () => {
    setModalContacts([...modalContacts, { name: "", designation: "", email: "", phone: "", isPrimary: false }]);
  };
  const removeModalContactRow = (idx) => {
    setModalContacts(modalContacts.filter((_, i) => i !== idx));
  };
  const updateModalContact = (idx, field, value) => {
    setModalContacts(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addModalSpecRow = () => {
    setModalSpecs([...modalSpecs, { key: "", value: "" }]);
  };
  const removeModalSpecRow = (idx) => {
    setModalSpecs(modalSpecs.filter((_, i) => i !== idx));
  };
  const updateModalSpec = (idx, field, value) => {
    setModalSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!compName || modalContacts.some(c => c.isPrimary && (!c.name || !c.email))) {
      setFormError("Please fill in Company Name, Primary Contact Name, and Primary Contact Email.");
      return;
    }

    const finalSpecsObj = {};
    modalSpecs.forEach(s => {
      if (s.key) {
        finalSpecsObj[s.key] = s.value || "N/A";
      }
    });

    const leadPayload = {
      companyName: compName,
      industry: compIndustry,
      companySize: compSize,
      annualRevenue: parseFloat(compRevenue) || 0,
      address: { city: compCity || "Unknown", country: compCountry },
      contacts: modalContacts.filter(c => c.name),
      source: leadSource,
      leadScore: parseInt(leadScore) || 50,
      customFields: finalSpecsObj
    };

    try {
      const created = await createLead(leadPayload);
      setLeads(prev => [created, ...prev]);
      setApiConnected(!isLeadOffline);
    } catch (err) {
      console.warn("Server Offline: Registering lead entity locally.", err);
      const localFallback = {
        ...leadPayload,
        _id: `lead_local_${Date.now()}`,
        assignedBDA: user ? { name: user.name, avatar: user.avatar } : { name: "Vikash Kumar" },
        tasks: [],
        logs: []
      };
      setLeads(prev => [localFallback, ...prev]);
    }

    setShowCreateModal(false);
    setModalStep(1);
    setCompName("");
    setCompRevenue("");
    setCompCity("");
    setModalContacts([{ name: "", designation: "", email: "", phone: "", isPrimary: true }]);
    setModalSpecs([
      { key: "preferredMaterial", value: "" },
      { key: "customTolerance", value: "" }
    ]);
    setFormError("");
  };

  const stages = ["New", "Contacted", "Qualified", "Quoted", "Negotiating", "Won", "Lost"];

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = lead.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lead.contacts?.some(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            lead.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIndustry = industryFilter === "All" || lead.industry === industryFilter;
      
      let matchesScore = true;
      if (scoreFilter === "Hot") matchesScore = lead.leadScore > 80;
      else if (scoreFilter === "Warm") matchesScore = lead.leadScore >= 50 && lead.leadScore <= 80;
      else if (scoreFilter === "Cold") matchesScore = lead.leadScore < 50;

      return matchesSearch && matchesIndustry && matchesScore;
    })
    .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));

  const promoteLeadStage = async (leadId, nextStatus) => {
    try {
      const updated = await updateLead(leadId, { status: nextStatus });
      setLeads(prev => prev.map(l => l._id === leadId ? updated : l));
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead(updated);
      }
      setApiConnected(!isLeadOffline);
    } catch (err) {
      console.warn("Offline fallback state mutation directly on status index.");
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: nextStatus } : l));
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: nextStatus }));
      }
    }
  };

  const shiftLeadStage = (leadId, direction) => {
    const lead = leads.find(l => l._id === leadId);
    if (!lead) return;

    const currentIndex = stages.indexOf(lead.status);
    let nextIndex = currentIndex + (direction === "right" ? 1 : -1);

    if (nextIndex >= 0 && nextIndex < stages.length) {
      promoteLeadStage(leadId, stages[nextIndex]);
    }
  };

  const handleDeleteLead = (leadId) => {
    const leadObj = leads.find(l => l._id === leadId);
    setDeleteConfirmation({
      isOpen: true,
      type: "lead",
      id: leadId,
      message: `Are you absolutely sure you want to permanently delete the lead record for "${leadObj?.companyName || "this company"}"? All associated checklist tasks and communication logs will be permanently deleted.`
    });
  };

  const toggleTaskCompletion = async (leadId, taskId) => {
    try {
      const updatedTask = await toggleTask(leadId, taskId);
      setLeads(prev => prev.map(l => {
        if (l._id === leadId) {
          const updatedTasks = l.tasks.map(t => t.id === taskId ? updatedTask : t);
          const updated = { ...l, tasks: updatedTasks };
          if (selectedLead && selectedLead._id === leadId) {
            setSelectedLead(updated);
          }
          return updated;
        }
        return l;
      }));
    } catch (err) {
      // Local UI mutation toggle on network fail
      setLeads(prev => prev.map(l => {
        if (l._id === leadId) {
          const updatedTasks = l.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
          const updated = { ...l, tasks: updatedTasks };
          if (selectedLead && selectedLead._id === leadId) {
            setSelectedLead(updated);
          }
          return updated;
        }
        return l;
      }));
    }
  };

  const handleAddChecklistTask = async (e) => {
    e.preventDefault();
    if (!newChecklistLabel.trim() || !selectedLead) return;

    try {
      const labelVal = newChecklistLabel.trim();
      setNewChecklistLabel("");
      
      const createdTask = await addTask(selectedLead._id, labelVal);
      setLeads(prev => prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, tasks: [...(l.tasks || []), createdTask] };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      }));
    } catch (err) {
      const mockLocalTask = { id: `task_${Date.now()}`, label: newChecklistLabel.trim(), completed: false };
      setNewChecklistLabel("");
      setLeads(prev => prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, tasks: [...(l.tasks || []), mockLocalTask] };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      }));
    }
  };

  const handleDeleteChecklistTask = async (taskId) => {
    if (!selectedLead) return;

    try {
      await deleteTask(selectedLead._id, taskId);
      setLeads(prev => prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, tasks: l.tasks.filter(t => t.id !== taskId) };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      }));
    } catch (err) {
      setLeads(prev => prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, tasks: l.tasks.filter(t => t.id !== taskId) };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      }));
    }
  };

  const handleDragStart = (e, leadId) => {
    setDraggingLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
  };

  const handleDragEnd = () => {
    setDraggingLeadId(null);
    setActiveDragOverStage(null);
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    if (activeDragOverStage !== stage) {
      setActiveDragOverStage(stage);
    }
  };

  const handleDragLeave = (e, stage) => {
    if (activeDragOverStage === stage) {
      setActiveDragOverStage(null);
    }
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggingLeadId;
    if (leadId) {
      promoteLeadStage(leadId, stage);
    }
    setDraggingLeadId(null);
    setActiveDragOverStage(null);
  };

  const formatPipelineRevenue = (revenue) => {
    if (revenue >= 10000000) return `₹${(revenue / 10000000).toFixed(2)} Cr`;
    if (revenue >= 100000) return `₹${(revenue / 100000).toFixed(1)} L`;
    return `₹${revenue.toLocaleString("en-IN")}`;
  };

  const getColumnStats = (stage) => {
    const stageLeads = filteredLeads.filter(l => l.status === stage);
    const totalRev = stageLeads.reduce((sum, l) => sum + l.annualRevenue, 0);
    return {
      count: stageLeads.length,
      revenue: formatPipelineRevenue(totalRev)
    };
  };

  const getLogIconDetails = (logType) => {
    switch (logType) {
      case "Call": return { icon: PhoneCall, color: "text-success", bg: "bg-success-light" };
      case "Email": return { icon: Mail, color: "text-info", bg: "bg-info-light" };
      case "Meeting": return { icon: UsersIcon, color: "text-warning", bg: "bg-warning-light" };
      case "Site Visit": return { icon: MapPin, color: "text-error", bg: "bg-error-light" };
      default: return { icon: UsersIcon, color: "text-muted", bg: "bg-muted-light" };
    }
  };

  const [newLogType, setNewLogType] = useState("Call");
  const [newLogSubject, setNewLogSubject] = useState("");
  const [newLogSummary, setNewLogSummary] = useState("");

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogSubject || !newLogSummary || !selectedLead) return;

    const logPayload = {
      type: newLogType,
      subject: newLogSubject,
      summary: newLogSummary,
      date: new Date().toISOString().split("T")[0],
      contactPerson: selectedLead.contacts?.find(c => c.isPrimary)?.name || "Representative"
    };

    setNewLogSubject("");
    setNewLogSummary("");

    try {
      const createdLog = await addLog(selectedLead._id, logPayload);
      setLeads(prev => prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, logs: [createdLog, ...(l.logs || [])] };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      }));
    } catch (err) {
      const offlineLog = { ...logPayload, id: `log_${Date.now()}` };
      setLeads(prev => prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, logs: [offlineLog, ...(l.logs || [])] };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      }));
    }
  };

  const handleDeleteLog = (logId) => {
    if (!selectedLead) return;
    setDeleteConfirmation({
      isOpen: true,
      type: "log",
      id: logId,
      extraId: selectedLead._id,
      message: "Are you sure you want to permanently delete this communication activity log entry from the history log?"
    });
  };

  const executeDeleteOperation = async () => {
    const { type, id, extraId } = deleteConfirmation;
    setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));

    if (type === "lead") {
      try {
        await deleteLead(id);
        setLeads(prev => prev.filter(l => l._id !== id));
        if (selectedLead && selectedLead._id === id) {
          setSelectedLead(null);
        }
        setApiConnected(!isLeadOffline);
      } catch (err) {
        console.error("Failed to delete lead", err);
      }
    } else if (type === "log") {
      try {
        await deleteLog(extraId, id);
        setLeads(prev => prev.map(l => {
          if (l._id === extraId) {
            const updated = { ...l, logs: l.logs.filter(log => log.id !== id && log._id !== id) };
            setSelectedLead(updated);
            return updated;
          }
          return l;
        }));
        setApiConnected(!isLeadOffline);
      } catch (err) {
        console.error("Failed to delete log", err);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Company Name", "Industry", "Company Size", "Annual Revenue (INR)", 
      "City", "Country", "Lead Score", "Pipeline Stage", "Inbound Source", 
      "Primary Contact", "Primary Contact Email", "Primary Contact Phone", "Custom Engineering Specs"
    ];

    const rows = filteredLeads.map(lead => {
      const primaryContact = lead.contacts?.find(c => c.isPrimary) || lead.contacts?.[0] || {};
      const specsString = lead.customFields 
        ? Object.entries(lead.customFields).map(([k, v]) => `${k}:${v}`).join("; ")
        : "";

      return [
        `"${lead.companyName?.replace(/"/g, '""') || ""}"`,
        `"${lead.industry || ""}"`,
        `"${lead.companySize || "N/A"}"`,
        lead.annualRevenue || 0,
        `"${lead.address?.city || "Unknown"}"`,
        `"${lead.address?.country || "India"}"`,
        lead.leadScore || 0,
        `"${lead.status || ""}"`,
        `"${lead.source || ""}"`,
        `"${(primaryContact.name || "").replace(/"/g, '""')}"`,
        `"${primaryContact.email || ""}"`,
        `"${primaryContact.phone || ""}"`,
        `"${specsString.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ForgeCRM_Pipeline_Leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="leads-view fade-in">
      {deleteConfirmation.isOpen && (
        <div className="catalog-modal-backdrop fade-in" style={{ zIndex: 1100 }}>
          <div className="catalog-modal glass-panel active-pulse scale-in" style={{ maxWidth: "420px", textAlign: "center", padding: "30px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                <Trash2 size={24} style={{ color: "#ef4444" }} />
              </div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>Confirm Deletion</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
                {deleteConfirmation.message}
              </p>
              <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px" }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setDeleteConfirmation({ isOpen: false, type: null, id: null, extraId: null, message: "" })}
                >
                  Cancel
                </button>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: "#ef4444", color: "#fff", border: "1px solid #dc2626" }}
                  onClick={executeDeleteOperation}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="leads-controls glass-panel">
        <div className="search-filter-wrap">
          <div className="control-search">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search leads, stakeholders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="control-filter">
            <SlidersHorizontal size={14} />
            <select 
              value={industryFilter} 
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Industries</option>
              <option value="Automotive">Automotive</option>
              <option value="Aerospace">Aerospace</option>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Other">Other Vertical</option>
            </select>
          </div>

          <div className="control-filter">
            <SlidersHorizontal size={14} />
            <select 
              value={scoreFilter} 
              onChange={(e) => setScoreFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Scores</option>
              <option value="Hot">Hot Leads (&gt;80 Score)</option>
              <option value="Warm">Warm Leads (50-80 Score)</option>
              <option value="Cold">Cold Leads (&lt;50 Score)</option>
            </select>
          </div>

          <div className={`connection-badge ${apiConnected ? "connected" : "offline"}`}>
            {apiConnected ? (
              <>
                <CheckCircle size={10} />
                <span>DB Connected</span>
              </>
            ) : (
              <>
                <AlertCircle size={10} />
                <span>Local Offline Mode</span>
              </>
            )}
          </div>
        </div>

        <div className="view-toggle-wrap">
          <div className="toggle-btn-group">
            <button 
              className={`toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
              onClick={() => setViewMode("kanban")}
            >
              Kanban Board
            </button>
            <button 
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Spreadsheet
            </button>
          </div>

          <button 
            className="btn btn-secondary csv-export-btn"
            onClick={handleExportCSV}
            title="Download pipeline spreadsheet"
          >
            <Download size={14} /> Export CSV
          </button>

          <button 
            className="btn btn-primary create-lead-btn"
            onClick={() => {
              setShowCreateModal(true);
              setModalStep(1);
            }}
          >
            <Plus size={14} /> Add Corporate Lead
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="pipeline-board">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.status === stage);
            const { count, revenue } = getColumnStats(stage);
            const isDragOver = activeDragOverStage === stage;

            return (
              <div 
                key={stage} 
                className={`pipeline-column glass-panel col-accent-${stage} ${isDragOver ? "drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={(e) => handleDragLeave(e, stage)}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="column-header">
                  <div className="title-area">
                    <h4>{stage}</h4>
                    <span className="column-volume-subtext">{revenue}</span>
                  </div>
                  <span className="column-count badge badge-muted">{count}</span>
                </div>
                
                <div className="column-cards-list">
                  {stageLeads.length === 0 && (
                    <div className="empty-column-placeholder">
                      <span>Drop Card Here</span>
                    </div>
                  )}
                  {stageLeads.map((lead) => {
                    const totalTasks = lead.tasks?.length || 0;
                    const doneTasks = lead.tasks?.filter(t => t.completed).length || 0;
                    const progressPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
                    const isChecklistExpanded = expandedChecklistCardId === lead._id;
                    const isCardDragging = draggingLeadId === lead._id;

                    return (
                      <div 
                        key={lead._id} 
                        className={`lead-card glass-panel card-lift fade-in ${isCardDragging ? "dragging" : ""}`}
                        onClick={() => setSelectedLead(lead)}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, lead._id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="lead-card-header">
                          <span className="lead-industry badge badge-muted">{lead.industry}</span>
                          <div className={`score-tag score-${lead.leadScore > 80 ? 'high' : 'medium'}`}>
                            {lead.leadScore} pts
                          </div>
                        </div>
                        
                        <h5 className="lead-company">{lead.companyName}</h5>
                        
                        <div className="lead-meta-row">
                          <Building size={11} className="meta-icon" />
                          <span>{lead.contacts?.find(c => c.isPrimary)?.name || lead.contacts?.[0]?.name || "No contacts"}</span>
                        </div>
                        
                        <div className="lead-meta-row">
                          <MapPin size={11} className="meta-icon" />
                          <span>{lead.address?.city || "Unknown City"}</span>
                        </div>

                        {totalTasks > 0 && (
                          <div className="card-task-progress-block" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="card-checklist-toggle-btn"
                              onClick={() => setExpandedChecklistCardId(isChecklistExpanded ? null : lead._id)}
                            >
                              <span>Checklist Progress</span>
                              <div className="toggle-label-wrap">
                                <span>{doneTasks}/{totalTasks} ({progressPercentage}%)</span>
                                {isChecklistExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                              </div>
                            </button>

                            {isChecklistExpanded ? (
                              <div className="card-expanded-checklist fade-in">
                                {lead.tasks.map((task) => (
                                  <label key={task.id} className="card-task-checkbox-row">
                                    <input 
                                      type="checkbox" 
                                      checked={task.completed} 
                                      onChange={() => toggleTaskCompletion(lead._id, task.id)}
                                      className="task-checkbox"
                                    />
                                    <span className={task.completed ? "completed-strike" : ""}>
                                      {task.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <div className="progress-bar-wrap">
                                <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="card-footer-controls-refined" onClick={(e) => e.stopPropagation()}>
                          <div className="arrow-controls-wrap">
                            <button 
                              className="shift-arrow-btn" 
                              onClick={() => shiftLeadStage(lead._id, "left")}
                              disabled={stage === "New"}
                            >
                              <ChevronLeft size={13} />
                            </button>
                            <span className="stage-footer-indicator">{lead.status}</span>
                            <button 
                              className="shift-arrow-btn" 
                              onClick={() => shiftLeadStage(lead._id, "right")}
                              disabled={stage === "Lost"}
                            >
                              <ChevronRight size={13} />
                            </button>
                          </div>
                          {lead.assignedBDA && (
                            <div 
                              className="card-bda-avatar-placeholder" 
                              title={typeof lead.assignedBDA === "object" && lead.assignedBDA.name ? `Assigned to ${lead.assignedBDA.name}` : "Assigned"}
                            >
                              {(typeof lead.assignedBDA === "object" && lead.assignedBDA.name) 
                                ? lead.assignedBDA.name.charAt(0) 
                                : "A"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-card glass-panel fade-in">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Primary Contact</th>
                <th>Deal potential</th>
                <th>Pipeline Stage</th>
                <th>Lead Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id} className="table-row-hover" onClick={() => setSelectedLead(lead)}>
                  <td><strong>{lead.companyName}</strong></td>
                  <td>{lead.industry}</td>
                  <td>{lead.address?.city || "Unknown"}, {lead.address?.country || "India"}</td>
                  <td>
                    <div className="table-contact-cell">
                      <span>{lead.contacts?.find(c => c.isPrimary)?.name || lead.contacts?.[0]?.name}</span>
                      <small>{lead.contacts?.find(c => c.isPrimary)?.email || lead.contacts?.[0]?.email}</small>
                    </div>
                  </td>
                  <td><strong>₹{(lead.annualRevenue || 0).toLocaleString("en-IN")}</strong></td>
                  <td>
                    <span className={`badge ${
                      lead.status === "Won" ? "badge-success" : 
                      lead.status === "Lost" ? "badge-error" : 
                      lead.status === "Quoted" || lead.status === "Negotiating" ? "badge-warning" : 
                      "badge-info"
                    }`}>{lead.status}</span>
                  </td>
                  <td><div className="table-score-badge">{lead.leadScore}</div></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="table-delete-row-btn" 
                      onClick={() => handleDeleteLead(lead._id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLead && (
        <div className="lead-drawer-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="lead-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-block">
                <span className="badge badge-info">{selectedLead.industry} Vertical</span>
                <h3>{selectedLead.companyName}</h3>
                <p>Lead Qualified at score <strong>{selectedLead.leadScore}/100</strong></p>
              </div>
              <div className="drawer-header-actions">
                <button 
                  className="btn btn-secondary purge-lead-btn"
                  onClick={() => handleDeleteLead(selectedLead._id)}
                >
                  <Trash2 size={13} />
                </button>
                <button className="close-drawer-btn" onClick={() => setSelectedLead(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="drawer-body">
              <div className="drawer-section workflow-progression">
                <h4>Interactive Pipeline Stage Tracker</h4>
                <div className="chevron-tracker">
                  {stages.map((stage) => {
                    const currentIndex = stages.indexOf(selectedLead.status);
                    const stepIndex = stages.indexOf(stage);
                    
                    let stepClass = "future";
                    if (selectedLead.status === stage) {
                      stepClass = "active";
                    } else if (selectedLead.status === "Lost" && stage === "Won") {
                      stepClass = "future";
                    } else if (selectedLead.status === "Won" && stage === "Lost") {
                      stepClass = "future";
                    } else if (stepIndex < currentIndex) {
                      stepClass = "completed";
                    }

                    return (
                      <button
                        key={stage}
                        className={`chevron-step ${stepClass}`}
                        onClick={() => promoteLeadStage(selectedLead._id, stage)}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="drawer-section">
                <h4>Pre-Qualification Action Items</h4>
                <form onSubmit={handleAddChecklistTask} className="drawer-add-checklist-form">
                  <input 
                    type="text" 
                    placeholder="Add custom pre-qualification step..."
                    value={newChecklistLabel}
                    onChange={(e) => setNewChecklistLabel(e.target.value)}
                    className="drawer-checklist-input"
                  />
                  <button type="submit" className="btn btn-primary add-checklist-submit-btn">
                    <Plus size={12} /> Add Step
                  </button>
                </form>

                {selectedLead.tasks?.length > 0 ? (
                  <div className="interactive-task-checklist">
                    {selectedLead.tasks.map((task) => (
                      <div key={task.id} className="task-checkbox-row card-lift">
                        <label className="checkbox-click-area">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTaskCompletion(selectedLead._id, task.id)}
                            className="task-checkbox"
                          />
                          <span className={`task-checkbox-label ${task.completed ? "completed-strike" : ""}`}>
                            {task.label}
                          </span>
                        </label>
                        <button 
                          className="task-delete-btn"
                          onClick={() => handleDeleteChecklistTask(task.id)}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-checklist-notice">No checklist items set. Create one above!</div>
                )}
              </div>

              <div className="drawer-section">
                <h4>Stakeholder Contacts Directory</h4>
                <div className="contacts-subgrid">
                  {selectedLead.contacts?.map((contact, idx) => (
                    <div key={idx} className={`contact-drawer-card ${contact.isPrimary ? "primary-border active-pulse" : ""}`}>
                      <div className="contact-card-title">
                        <strong>{contact.name}</strong>
                        {contact.isPrimary && <span className="badge badge-success badge-small">Primary</span>}
                      </div>
                      <span className="contact-designation">{contact.designation}</span>
                      <div className="contact-meta-field">
                        <Mail size={12} />
                        <span>{contact.email}</span>
                      </div>
                      <div className="contact-meta-field">
                        <Phone size={12} />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="drawer-section">
                <h4>Custom Engineering Specifications & Value</h4>
                <div className="specs-drawer-grid">
                  <div className="spec-drawer-item">
                    <span className="spec-key">Annual Deal Potential</span>
                    <strong className="spec-val text-gradient">₹{(selectedLead.annualRevenue || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  {selectedLead.customFields && Object.entries(selectedLead.customFields).map(([key, value]) => (
                    <div key={key} className="spec-drawer-item">
                      <span className="spec-key">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <strong className="spec-val">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="drawer-section">
                <h4>Communication Activity Logger</h4>
                <form onSubmit={handleAddLog} className="quick-logger-form">
                  <div className="log-inputs-row">
                    <select 
                      value={newLogType} 
                      onChange={(e) => setNewLogType(e.target.value)}
                      className="log-type-select"
                    >
                      <option value="Call">Call Log</option>
                      <option value="Email">Email Log</option>
                      <option value="Meeting">Meeting Minutes</option>
                      <option value="Site Visit">Site Survey Visit</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Discussion Subject..." 
                      value={newLogSubject}
                      onChange={(e) => setNewLogSubject(e.target.value)}
                      className="log-subject-input"
                    />
                  </div>
                  <textarea 
                    placeholder="Enter exhaustive summary of conversation..." 
                    value={newLogSummary}
                    onChange={(e) => setNewLogSummary(e.target.value)}
                    className="log-summary-textarea"
                    rows={2}
                  />
                  <button type="submit" className="btn btn-secondary log-submit-btn">
                    <PlusCircle size={14} /> Log Communication Detail
                  </button>
                </form>

                <div className="logs-timeline">
                  {selectedLead.logs?.length === 0 ? (
                    <div className="empty-logs-desc">No communications logged yet.</div>
                  ) : (
                    selectedLead.logs?.map((log, idx) => {
                      const details = getLogIconDetails(log.type);
                      const LogIcon = details.icon;
                      return (
                        <div key={log.id || idx} className="timeline-item">
                          <div className={`timeline-badge ${details.bg} ${details.color}`}>
                            <LogIcon size={13} />
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-meta">
                              <strong>{log.type}: {log.subject}</strong>
                              <div className="timeline-meta-controls">
                                <span>{log.date}</span>
                                <button 
                                  className="log-delete-inline-btn"
                                  onClick={() => handleDeleteLog(log.id || log._id)}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                            <p>{log.summary}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="lead-modal-backdrop" onClick={() => { setShowCreateModal(false); setModalStep(1); }}>
          <div className="lead-modal glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-block">
                <Briefcase size={20} className="modal-header-icon" />
                <h3>Add New B2B Corporate Lead</h3>
              </div>
              <button className="close-modal-btn" onClick={() => { setShowCreateModal(false); setModalStep(1); }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="modal-form-body">
              {formError && <div className="auth-error-badge">{formError}</div>}

              <div className="modal-stepper-tracker">
                <div className={`step-item ${modalStep === 1 ? "active" : modalStep > 1 ? "completed" : ""}`}>
                  <span className="step-num">{modalStep > 1 ? "✓" : "1"}</span>
                  <span className="step-label">Company</span>
                </div>
                <div className={`step-line ${modalStep > 1 ? "active" : ""}`} />
                <div className={`step-item ${modalStep === 2 ? "active" : modalStep > 2 ? "completed" : ""}`}>
                  <span className="step-num">{modalStep > 2 ? "✓" : "2"}</span>
                  <span className="step-label">Contacts</span>
                </div>
                <div className={`step-line ${modalStep > 2 ? "active" : ""}`} />
                <div className={`step-item ${modalStep === 3 ? "active" : ""}`}>
                  <span className="step-num">3</span>
                  <span className="step-label">Technical</span>
                </div>
              </div>

              {modalStep === 1 && (
                <div className="step-slide-container fade-in">
                  <div className="form-section-title">Corporate Profile</div>
                  <div className="modal-form-grid">
                    <div className="form-group">
                      <label className="form-label">Company Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Reliance Power Ltd" 
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        className="modal-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry Vertical</label>
                      <select 
                        value={compIndustry} 
                        onChange={(e) => setCompIndustry(e.target.value)}
                        className="modal-input"
                      >
                        <option value="Automotive">Automotive</option>
                        <option value="Aerospace">Aerospace</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Heavy Machinery">Heavy Machinery</option>
                        <option value="Other">Other Vertical</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company Size</label>
                      <select 
                        value={compSize} 
                        onChange={(e) => setCompSize(e.target.value)}
                        className="modal-input"
                      >
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ Enterprise</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Annual Revenue Potential (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 5000000" 
                        value={compRevenue}
                        onChange={(e) => setCompRevenue(e.target.value)}
                        className="modal-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Nagpur" 
                        value={compCity}
                        onChange={(e) => setCompCity(e.target.value)}
                        className="modal-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input 
                        type="text" 
                        placeholder="e.g. India" 
                        value={compCountry}
                        onChange={(e) => setCompCountry(e.target.value)}
                        className="modal-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="step-slide-container fade-in scrollable-step-pane">
                  <div className="form-section-title flex-title">
                    <span>Stakeholder Contacts</span>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-small inline-add-row-btn"
                      onClick={addModalContactRow}
                    >
                      <Plus size={10} /> Add Contact Row
                    </button>
                  </div>

                  <div className="dynamic-inputs-panel">
                    {modalContacts.map((contact, idx) => (
                      <div key={idx} className="dynamic-input-row fade-in">
                        <div className="input-row-header-title">
                          <strong>Contact Stakeholder #{idx + 1}</strong>
                          {modalContacts.length > 1 && (
                            <button 
                              type="button" 
                              className="delete-row-btn"
                              onClick={() => removeModalContactRow(idx)}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                        <div className="modal-form-grid">
                          <div className="form-group">
                            <label className="form-label">Stakeholder Name *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Dr. Anil Mukherji" 
                              value={contact.name}
                              onChange={(e) => updateModalContact(idx, "name", e.target.value)}
                              className="modal-input"
                              required={contact.isPrimary}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Designation</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Purchase Director" 
                              value={contact.designation}
                              onChange={(e) => updateModalContact(idx, "designation", e.target.value)}
                              className="modal-input"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input 
                              type="email" 
                              placeholder="e.g. buyer@tata.com" 
                              value={contact.email}
                              onChange={(e) => updateModalContact(idx, "email", e.target.value)}
                              className="modal-input"
                              required={contact.isPrimary}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input 
                              type="text" 
                              placeholder="e.g. +91 9800 0000" 
                              value={contact.phone}
                              onChange={(e) => updateModalContact(idx, "phone", e.target.value)}
                              className="modal-input"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <div className="step-slide-container fade-in scrollable-step-pane">
                  <div className="form-section-title flex-title">
                    <span>Technical Specifications Specs</span>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-small inline-add-row-btn"
                      onClick={addModalSpecRow}
                    >
                      <Plus size={10} /> Add Custom Spec
                    </button>
                  </div>

                  <div className="dynamic-inputs-panel spec-fields-panel">
                    {modalSpecs.map((spec, idx) => (
                      <div key={idx} className="dynamic-spec-row fade-in">
                        <input 
                          type="text" 
                          placeholder="Specification Name..." 
                          value={spec.key}
                          onChange={(e) => updateModalSpec(idx, "key", e.target.value)}
                          className="spec-key-input"
                        />
                        <input 
                          type="text" 
                          placeholder="Spec value details..." 
                          value={spec.value}
                          onChange={(e) => updateModalSpec(idx, "value", e.target.value)}
                          className="spec-val-input"
                        />
                        {modalSpecs.length > 1 && (
                          <button 
                            type="button" 
                            className="delete-row-btn"
                            onClick={() => removeModalSpecRow(idx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="form-section-title">Lead Assignment</div>
                  <div className="modal-form-grid">
                    <div className="form-group">
                      <label className="form-label">Inbound Request Source</label>
                      <select 
                        value={leadSource} 
                        onChange={(e) => setLeadSource(e.target.value)}
                        className="modal-input"
                      >
                        <option value="Direct RFQ (Request for Quote)">Direct RFQ</option>
                        <option value="Website Inbound">Website Inbound</option>
                        <option value="Trade Show">Trade Show</option>
                        <option value="LinkedIn Outreach">LinkedIn Outreach</option>
                        <option value="Cold Outreach">Cold Outreach</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pre-Qualification Lead Score (0-100)</label>
                      <input 
                        type="number" 
                        value={leadScore}
                        onChange={(e) => setLeadScore(e.target.value)}
                        min="0"
                        max="100"
                        className="modal-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-actions-bar">
                {modalStep > 1 ? (
                  <button 
                    type="button" 
                    className="btn btn-secondary nav-arrow-btn" 
                    onClick={() => {
                      setFormError("");
                      setModalStep(modalStep - 1);
                    }}
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowCreateModal(false);
                      setModalStep(1);
                      setFormError("");
                    }}
                  >
                    Cancel
                  </button>
                )}

                {modalStep < 3 ? (
                  <button 
                    type="button" 
                    className="btn btn-primary nav-arrow-btn"
                    onClick={() => {
                      if (modalStep === 1 && !compName) {
                        setFormError("Company Name is required to proceed.");
                        return;
                      }
                      setFormError("");
                      setModalStep(modalStep + 1);
                    }}
                  >
                    Next <ArrowRight size={13} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary modal-save-btn">
                    <FileCheck size={16} /> Create Corporate Lead
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}