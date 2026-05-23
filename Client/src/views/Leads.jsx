import React from "react";
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
import "./Leads.css";

// Dynamic API Integration configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export default function Leads({ user }) {
  const [leads, setLeads] = React.useState([]);
  const [viewMode, setViewMode] = React.useState("kanban");
  const [selectedLead, setSelectedLead] = React.useState(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [modalStep, setModalStep] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [industryFilter, setIndustryFilter] = React.useState("All");
  const [scoreFilter, setScoreFilter] = React.useState("All"); // "All", "Hot", "Warm", "Cold"
  const [expandedChecklistCardId, setExpandedChecklistCardId] = React.useState(null);

  // Native Drag and Drop State
  const [draggingLeadId, setDraggingLeadId] = React.useState(null);
  const [activeDragOverStage, setActiveDragOverStage] = React.useState(null);

  // New checklist task on the fly
  const [newChecklistLabel, setNewChecklistLabel] = React.useState("");

  // Server connection status indicator
  const [apiConnected, setApiConnected] = React.useState(false);

  // Mock initial leads data as fallback
  const mockLeadsData = [
    {
      _id: "lead_1",
      companyName: "Tata Motors Defence Division",
      industry: "Automotive",
      companySize: "500+",
      annualRevenue: 45000000, // ₹4.5 Crore
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
      annualRevenue: 120000000, // ₹12 Crore
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
      companyName: "Haldiram Processors Ltd",
      industry: "Other",
      companySize: "201-500",
      annualRevenue: 8500000, // ₹85 Lakhs
      address: { city: "Nagpur", country: "India" },
      contacts: [
        { name: "Rajesh Haldiram", designation: "Director Procurement", email: "r.procure@haldiram.com", phone: "+91 71 2277 9900", isPrimary: true }
      ],
      status: "New",
      source: "Website Inbound",
      assignedBDA: { name: "Pooja Patel", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
      leadScore: 64,
      customFields: {
        preferredMaterial: "SS316L Food Grade",
        certification: "FDA Approved Material"
      },
      tasks: [
        { id: "t3_1", label: "Confirm FDA food safety certificates", completed: false },
        { id: "t3_2", label: "Log procurement director callback", completed: false }
      ],
      logs: []
    },
    {
      _id: "lead_4",
      companyName: "Hindustan Aeronautics (HAL)",
      industry: "Aerospace",
      companySize: "500+",
      annualRevenue: 150000000, // ₹15 Crore
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
        { id: "t4_1", label: "Acquire AS9100 Rev D checklist sheets", completed: true },
        { id: "t4_2", label: "Establish ultrasonic non-destructive testing costs", completed: true },
        { id: "t4_3", label: "Approve Inconel turbine pin margins", completed: true }
      ],
      logs: [
        { id: "l4_1", date: "2026-05-19", type: "Email", subject: "Quotation Q-4082-01 Sent", summary: "Sent quote for Inconel engine pins. Valid for 30 days." }
      ]
    }
  ];

  // Load leads from API with local persistence failover
  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("crm_access_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}/leads`, {
          method: "GET",
          headers,
          credentials: "include"
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setLeads(res.data);
            setApiConnected(true);
            localStorage.setItem("crm_leads_data", JSON.stringify(res.data));
            return;
          }
        }
      } catch (err) {
        console.warn("Backend pipeline offline, fallback to local storage storage.");
      }

      // Local storage check
      const localData = localStorage.getItem("crm_leads_data");
      if (localData) {
        try {
          setLeads(JSON.parse(localData));
        } catch (e) {
          setLeads(mockLeadsData);
        }
      } else {
        setLeads(mockLeadsData);
        localStorage.setItem("crm_leads_data", JSON.stringify(mockLeadsData));
      }
      setApiConnected(false);
    };

    fetchLeads();
  }, []);

  // Save Leads helper
  const persistLeads = (newLeadsData) => {
    setLeads(newLeadsData);
    localStorage.setItem("crm_leads_data", JSON.stringify(newLeadsData));
  };

  // Lead Creation Form states
  const [compName, setCompName] = React.useState("");
  const [compIndustry, setCompIndustry] = React.useState("Automotive");
  const [compSize, setCompSize] = React.useState("51-200");
  const [compRevenue, setCompRevenue] = React.useState("");
  const [compCity, setCompCity] = React.useState("");
  const [compCountry, setCompCountry] = React.useState("India");
  const [leadSource, setLeadSource] = React.useState("Direct RFQ (Request for Quote)");
  const [leadScore, setLeadScore] = React.useState(75);

  // Dynamic lists in Modal: Multi-contacts & Custom Specs
  const [modalContacts, setModalContacts] = React.useState([
    { name: "", designation: "", email: "", phone: "", isPrimary: true }
  ]);
  const [modalSpecs, setModalSpecs] = React.useState([
    { key: "preferredMaterial", value: "" },
    { key: "customTolerance", value: "" }
  ]);

  const [formError, setFormError] = React.useState("");

  // Helpers for multi-contacts in modal
  const addModalContactRow = () => {
    setModalContacts([...modalContacts, { name: "", designation: "", email: "", phone: "", isPrimary: false }]);
  };
  const removeModalContactRow = (idx) => {
    setModalContacts(modalContacts.filter((_, i) => i !== idx));
  };
  const updateModalContact = (idx, field, value) => {
    setModalContacts(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  // Helpers for dynamic custom specs in modal
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

    const newLead = {
      _id: `lead_${Date.now()}`,
      companyName: compName,
      industry: compIndustry,
      companySize: compSize,
      annualRevenue: parseFloat(compRevenue) || 0,
      address: { city: compCity || "Unknown", country: compCountry },
      contacts: modalContacts.filter(c => c.name),
      status: "New",
      source: leadSource,
      assignedBDA: { 
        name: user.name, 
        avatar: user.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
      },
      leadScore: parseInt(leadScore) || 50,
      customFields: finalSpecsObj,
      tasks: [
        { id: `t_${Date.now()}_1`, label: "Complete initial requirements review call", completed: false },
        { id: `t_${Date.now()}_2`, label: "Create catalog parts matching checklist", completed: false }
      ],
      logs: []
    };

    const updatedLeadsList = [newLead, ...leads];
    persistLeads(updatedLeadsList);
    setShowCreateModal(false);
    setModalStep(1);
    
    // Clear inputs
    setCompName("");
    setCompRevenue("");
    setCompCity("");
    setModalContacts([{ name: "", designation: "", email: "", phone: "", isPrimary: true }]);
    setModalSpecs([
      { key: "preferredMaterial", value: "" },
      { key: "customTolerance", value: "" }
    ]);
    setFormError("");

    // API Sync
    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers,
        body: JSON.stringify(newLead),
        credentials: "include"
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.data) {
          // Update temp ID with server id
          persistLeads(updatedLeadsList.map(l => l._id === newLead._id ? res.data : l));
        }
      }
    } catch (err) {
      console.log("Registered lead offline-saved locally.");
    }
  };

  // Stages of the Kanban Pipeline
  const stages = ["New", "Contacted", "Qualified", "Quoted", "Negotiating", "Won", "Lost"];

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.contacts.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          lead.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = industryFilter === "All" || lead.industry === industryFilter;
    
    let matchesScore = true;
    if (scoreFilter === "Hot") matchesScore = lead.leadScore > 80;
    else if (scoreFilter === "Warm") matchesScore = lead.leadScore >= 50 && lead.leadScore <= 80;
    else if (scoreFilter === "Cold") matchesScore = lead.leadScore < 50;

    return matchesSearch && matchesIndustry && matchesScore;
  });

  // Promote lead status
  const promoteLeadStage = async (leadId, nextStatus) => {
    let updatedLeads = [];
    setLeads(prevLeads => {
      updatedLeads = prevLeads.map(l => {
        if (l._id === leadId) {
          const updated = { ...l, status: nextStatus };
          if (selectedLead && selectedLead._id === leadId) {
            setSelectedLead(updated);
          }
          return updated;
        }
        return l;
      });
      localStorage.setItem("crm_leads_data", JSON.stringify(updatedLeads));
      return updatedLeads;
    });

    // API Sync
    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: nextStatus }),
        credentials: "include"
      });
    } catch (err) {
      console.log("Updated status offline-saved locally.");
    }
  };

  // Move Lead Left/Right instantly (Quick Shifter)
  const shiftLeadStage = (leadId, direction) => {
    const lead = leads.find(l => l._id === leadId);
    if (!lead) return;

    const currentIndex = stages.indexOf(lead.status);
    let nextIndex = currentIndex + (direction === "right" ? 1 : -1);

    if (nextIndex >= 0 && nextIndex < stages.length) {
      promoteLeadStage(leadId, stages[nextIndex]);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this lead? All associated tasks and logs will be permanently deleted.")) {
      return;
    }

    const updated = leads.filter(l => l._id !== leadId);
    persistLeads(updated);
    if (selectedLead && selectedLead._id === leadId) {
      setSelectedLead(null);
    }

    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });
    } catch (err) {
      console.log("Deleted lead locally.");
    }
  };

  // Toggle checklist tasks
  const toggleTaskCompletion = async (leadId, taskId) => {
    let updatedLeads = [];
    setLeads(prev => {
      updatedLeads = prev.map(l => {
        if (l._id === leadId) {
          const updatedTasks = l.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
          const updated = { ...l, tasks: updatedTasks };
          if (selectedLead && selectedLead._id === leadId) {
            setSelectedLead(updated);
          }
          return updated;
        }
        return l;
      });
      localStorage.setItem("crm_leads_data", JSON.stringify(updatedLeads));
      return updatedLeads;
    });

    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${API_BASE_URL}/leads/${leadId}/tasks/${taskId}`, {
        method: "PUT",
        headers,
        credentials: "include"
      });
    } catch (err) {
      console.log("Toggled task locally.");
    }
  };

  // Add custom Checklist Task
  const handleAddChecklistTask = async (e) => {
    e.preventDefault();
    if (!newChecklistLabel.trim() || !selectedLead) return;

    const tempId = `task_${Date.now()}`;
    const newTask = { id: tempId, label: newChecklistLabel.trim(), completed: false };

    let updatedLeads = [];
    setLeads(prev => {
      updatedLeads = prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, tasks: [...(l.tasks || []), newTask] };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      });
      localStorage.setItem("crm_leads_data", JSON.stringify(updatedLeads));
      return updatedLeads;
    });

    const valToSubmit = newChecklistLabel.trim();
    setNewChecklistLabel("");

    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/leads/${selectedLead._id}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ label: valToSubmit }),
        credentials: "include"
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.data) {
          setLeads(prev => {
            const synced = prev.map(l => {
              if (l._id === selectedLead._id) {
                const updated = {
                  ...l,
                  tasks: l.tasks.map(t => t.id === tempId ? res.data : t)
                };
                setSelectedLead(updated);
                return updated;
              }
              return l;
            });
            localStorage.setItem("crm_leads_data", JSON.stringify(synced));
            return synced;
          });
        }
      }
    } catch (err) {
      console.log("Checklist item added locally.");
    }
  };

  // Delete Checklist Task
  const handleDeleteChecklistTask = async (taskId) => {
    if (!selectedLead) return;

    let updatedLeads = [];
    setLeads(prev => {
      updatedLeads = prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, tasks: l.tasks.filter(t => t.id !== taskId) };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      });
      localStorage.setItem("crm_leads_data", JSON.stringify(updatedLeads));
      return updatedLeads;
    });

    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${API_BASE_URL}/leads/${selectedLead._id}/tasks/${taskId}`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });
    } catch (err) {
      console.log("Deleted task locally.");
    }
  };

  // Native Drag and Drop Event Handlers
  const handleDragStart = (e, leadId) => {
    setDraggingLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    setDraggingLeadId(null);
    setActiveDragOverStage(null);
    e.currentTarget.classList.remove("dragging");
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

  // Format Large Currency values in Rupees (₹)
  const formatPipelineRevenue = (revenue) => {
    if (revenue >= 10000000) {
      return `₹${(revenue / 10000000).toFixed(2)} Cr`;
    }
    if (revenue >= 100000) {
      return `₹${(revenue / 100000).toFixed(1)} L`;
    }
    return `₹${revenue.toLocaleString("en-IN")}`;
  };

  // Calculate columns statistics (Financial Volumes & count)
  const getColumnStats = (stage) => {
    const stageLeads = filteredLeads.filter(l => l.status === stage);
    const totalRev = stageLeads.reduce((sum, l) => sum + l.annualRevenue, 0);
    return {
      count: stageLeads.length,
      revenue: formatPipelineRevenue(totalRev)
    };
  };

  // Timeline logs details helpers
  const getLogIconDetails = (logType) => {
    switch (logType) {
      case "Call": return { icon: PhoneCall, color: "text-success", bg: "bg-success-light" };
      case "Email": return { icon: Mail, color: "text-info", bg: "bg-info-light" };
      case "Meeting": return { icon: UsersIcon, color: "text-warning", bg: "bg-warning-light" };
      case "Site Visit": return { icon: MapPin, color: "text-error", bg: "bg-error-light" };
      default: return { icon: UsersIcon, color: "text-muted", bg: "bg-muted-light" };
    }
  };

  // Quick log adding
  const [newLogType, setNewLogType] = React.useState("Call");
  const [newLogSubject, setNewLogSubject] = React.useState("");
  const [newLogSummary, setNewLogSummary] = React.useState("");

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogSubject || !newLogSummary || !selectedLead) return;

    const tempId = `log_${Date.now()}`;
    const newLog = {
      id: tempId,
      date: new Date().toISOString().split("T")[0],
      type: newLogType,
      subject: newLogSubject,
      summary: newLogSummary,
      contactPerson: selectedLead.contacts.find(c => c.isPrimary)?.name || "Representative"
    };

    let updatedLeads = [];
    setLeads(prev => {
      updatedLeads = prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, logs: [newLog, ...(l.logs || [])] };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      });
      localStorage.setItem("crm_leads_data", JSON.stringify(updatedLeads));
      return updatedLeads;
    });

    const submitType = newLogType;
    const submitSubject = newLogSubject;
    const submitSummary = newLogSummary;

    setNewLogSubject("");
    setNewLogSummary("");

    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/leads/${selectedLead._id}/logs`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: submitType, subject: submitSubject, summary: submitSummary }),
        credentials: "include"
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.data) {
          setLeads(prev => {
            const synced = prev.map(l => {
              if (l._id === selectedLead._id) {
                const updated = {
                  ...l,
                  logs: l.logs.map(log => log.id === tempId ? res.data : log)
                };
                setSelectedLead(updated);
                return updated;
              }
              return l;
            });
            localStorage.setItem("crm_leads_data", JSON.stringify(synced));
            return synced;
          });
        }
      }
    } catch (err) {
      console.log("Logged call locally.");
    }
  };

  // Delete Log
  const handleDeleteLog = async (logId) => {
    if (!selectedLead || !window.confirm("Delete this communication activity log?")) return;

    let updatedLeads = [];
    setLeads(prev => {
      updatedLeads = prev.map(l => {
        if (l._id === selectedLead._id) {
          const updated = { ...l, logs: l.logs.filter(log => log.id !== logId) };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      });
      localStorage.setItem("crm_leads_data", JSON.stringify(updatedLeads));
      return updatedLeads;
    });

    try {
      const token = localStorage.getItem("crm_access_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${API_BASE_URL}/leads/${selectedLead._id}/logs/${logId}`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });
    } catch (err) {
      console.log("Deleted log locally.");
    }
  };

  // Export pipeline leads as CSV spreadsheet file (RFC 4180 aligned)
  const handleExportCSV = () => {
    const headers = [
      "Company Name",
      "Industry",
      "Company Size",
      "Annual Revenue (INR)",
      "City",
      "Country",
      "Lead Score",
      "Pipeline Stage",
      "Inbound Source",
      "Primary Contact",
      "Primary Contact Email",
      "Primary Contact Phone",
      "Custom Engineering Specs"
    ];

    const rows = filteredLeads.map(lead => {
      const primaryContact = lead.contacts?.find(c => c.isPrimary) || lead.contacts?.[0] || {};
      
      const specsString = lead.customFields 
        ? Object.entries(lead.customFields).map(([k, v]) => `${k}:${v}`).join("; ")
        : "";

      return [
        `"${lead.companyName.replace(/"/g, '""')}"`,
        `"${lead.industry}"`,
        `"${lead.companySize || "N/A"}"`,
        lead.annualRevenue,
        `"${lead.address?.city || "Unknown"}"`,
        `"${lead.address?.country || "India"}"`,
        lead.leadScore,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${(primaryContact.name || "").replace(/"/g, '""')}"`,
        `"${primaryContact.email || ""}"`,
        `"${primaryContact.phone || ""}"`,
        `"${specsString.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\ufeff" + [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

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
      {/* Dynamic Advanced Controls Bar */}
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

          {/* Lead Score Filter Range Dropdown */}
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

          {/* Connection status tag */}
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

          {/* Export Pipeline Spreadsheet */}
          <button 
            className="btn btn-secondary csv-export-btn"
            onClick={handleExportCSV}
            title="Download pipeline to Excel/CSV spreadsheet"
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

      {/* Main Kanban pipeline layout with native drag & drop */}
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
                
                {/* Column Header */}
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

                        {/* Collapsible Action Checklist directly on card */}
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

                            {/* Checklist expansion pane */}
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

                        {/* Card shifters & BDA Avatar */}
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

                          {/* BDA Avatar icon */}
                          {lead.assignedBDA && (
                            <img 
                              src={lead.assignedBDA.avatar} 
                              alt={lead.assignedBDA.name} 
                              className="card-bda-avatar"
                              title={`Assigned to ${lead.assignedBDA.name}`}
                            />
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
        /* Spreadsheet table layout */
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
                  <td>
                    <strong>{lead.companyName}</strong>
                  </td>
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
                  <td>
                    <div className="table-score-badge">{lead.leadScore}</div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="table-delete-row-btn" 
                      onClick={() => handleDeleteLead(lead._id)}
                      title="Purge lead records"
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

      {/* Slide-out detail Drawer */}
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
                  title="Purge Lead Records"
                >
                  <Trash2 size={13} />
                </button>
                <button className="close-drawer-btn" onClick={() => setSelectedLead(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="drawer-body">
              {/* Premium Visual Chevron Pipeline progression tracker */}
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
                      stepClass = "future"; // skip Won
                    } else if (selectedLead.status === "Won" && stage === "Lost") {
                      stepClass = "future"; // skip Lost
                    } else if (stepIndex < currentIndex) {
                      stepClass = "completed";
                    }

                    return (
                      <button
                        key={stage}
                        className={`chevron-step ${stepClass}`}
                        onClick={() => promoteLeadStage(selectedLead._id, stage)}
                        title={`Move pipeline to ${stage}`}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action checklist tasks */}
              <div className="drawer-section">
                <h4>Pre-Qualification Action Items</h4>
                
                {/* Dynamic Task Checklist Form */}
                <form onSubmit={handleAddChecklistTask} className="drawer-add-checklist-form">
                  <input 
                    type="text" 
                    placeholder="Add custom pre-qualification step... (e.g. Verify metallurgical tolerances)"
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
                          title="Delete pre-qualification item"
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

              {/* Contacts info */}
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

              {/* Technical Specifications Map with Rupees (₹) */}
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

              {/* Communication Activity log with colorful icons */}
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
                      placeholder="Discussion Subject (e.g. Chemical testing results)" 
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

                {/* Logs feed list */}
                <div className="logs-timeline">
                  {selectedLead.logs?.length === 0 ? (
                    <div className="empty-logs-desc">No communications logged yet. Use the logger above.</div>
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
                                  title="Delete log item"
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

      {/* ADVANCED DYNAMIC LEAD CREATION MODAL */}
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

              {/* Progress Stepper Header */}
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

              {/* Step 1: Corporate Profile */}
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

              {/* Step 2: Multi-contacts stakeholder list */}
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
                            <label className="form-label">Designation / Department</label>
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

              {/* Step 3: Technical Specifications & Assignment */}
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
                          placeholder="Specification Name (e.g., surfaceFinish)" 
                          value={spec.key}
                          onChange={(e) => updateModalSpec(idx, "key", e.target.value)}
                          className="spec-key-input"
                        />
                        <input 
                          type="text" 
                          placeholder="Spec value details (e.g., Ra < 0.4µm)" 
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

              {/* Bottom Nav Controls */}
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
