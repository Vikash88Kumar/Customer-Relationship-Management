import api from "../api/axios.js";

// Export reactive tracker for offline mode status specific to leads
export let isLeadOffline = false;

/**
 * Get All B2B Leads
 * Resolves pipelines with self-healing local storage cache fallback.
 */
export const getLeads = async () => {
  try {
    const response = await api.get("/leads");
    const serverLeads = response.data.data || [];
    
    // Warm local storage cache
    localStorage.setItem("crm_leads_data", JSON.stringify(serverLeads));
    isLeadOffline = false;
    
    return serverLeads;
  } catch (error) {
    console.warn("Leads Server Offline. Accessing cached B2B pipelines.", error.message);
    isLeadOffline = true;
    
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error("Failed to parse cached leads data", e);
      }
    }
    return []; // Return empty array if cache isn't initialized yet
  }
};

/**
 * Create a new B2B Lead
 * Registers in database. On server failover, persists in offline cache.
 */
export const createLead = async (leadData) => {
  try {
    const response = await api.post("/leads", leadData);
    const created = response.data.data;

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        localStorage.setItem("crm_leads_data", JSON.stringify([created, ...localList]));
      } catch (e) {}
    }

    isLeadOffline = false;
    return created;
  } catch (error) {
    console.warn("Leads Server Offline. Persisting lead locally in offline cache.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    let localList = [];
    if (cachedData) {
      try {
        localList = JSON.parse(cachedData);
      } catch (e) {
        console.error("Failed to parse cached leads", e);
      }
    }

    const localNewLead = {
      ...leadData,
      _id: `lead_local_${Date.now()}`,
      status: leadData.status || "New",
      tasks: [
        { id: `task_local_${Date.now()}_1`, label: "Complete initial requirements review call", completed: false },
        { id: `task_local_${Date.now()}_2`, label: "Create catalog parts matching checklist", completed: false }
      ],
      logs: []
    };

    const updatedList = [localNewLead, ...localList];
    localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));

    return localNewLead;
  }
};

/**
 * Update an existing B2B Lead
 */
export const updateLead = async (id, updateData) => {
  try {
    const response = await api.put(`/leads/${id}`, updateData);
    const updated = response.data.data;

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => l._id === id ? updated : l);
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
      } catch (e) {}
    }

    isLeadOffline = false;
    return updated;
  } catch (error) {
    console.warn("Leads Server Offline. Updating lead locally.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === id) {
            return { ...l, ...updateData };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
        return updatedList.find(l => l._id === id);
      } catch (e) {
        console.error("Failed to parse local leads during update", e);
      }
    }
    throw error;
  }
};

/**
 * Delete a B2B Lead
 */
export const deleteLead = async (id) => {
  try {
    const response = await api.delete(`/leads/${id}`);

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const filtered = localList.filter(l => l._id !== id);
        localStorage.setItem("crm_leads_data", JSON.stringify(filtered));
      } catch (e) {}
    }

    isLeadOffline = false;
    return response.data.data;
  } catch (error) {
    console.warn("Leads Server Offline. Deleting cached B2B lead.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const filtered = localList.filter(l => l._id !== id);
        localStorage.setItem("crm_leads_data", JSON.stringify(filtered));
        return { id };
      } catch (e) {
        console.error("Failed to delete local cached lead", e);
      }
    }
    throw error;
  }
};

/**
 * Add a Checklist Task to a Lead
 */
export const addTask = async (leadId, label) => {
  try {
    const response = await api.post(`/leads/${leadId}/tasks`, { label });
    const newTask = response.data.data;

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, tasks: [...(l.tasks || []), newTask] };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
      } catch (e) {}
    }

    isLeadOffline = false;
    return newTask;
  } catch (error) {
    console.warn("Leads Server Offline. Adding task locally.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const tempId = `task_local_${Date.now()}`;
        const newTask = { id: tempId, label, completed: false };

        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, tasks: [...(l.tasks || []), newTask] };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));

        return newTask;
      } catch (e) {
        console.error("Failed to add task offline", e);
      }
    }
    throw error;
  }
};

/**
 * Toggle Task Completion Status
 */
export const toggleTask = async (leadId, taskId) => {
  try {
    const response = await api.put(`/leads/${leadId}/tasks/${taskId}`);
    const toggledTask = response.data.data;

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            const updatedTasks = l.tasks.map(t => (t.id === taskId || t._id === taskId) ? toggledTask : t);
            return { ...l, tasks: updatedTasks };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
      } catch (e) {}
    }

    isLeadOffline = false;
    return toggledTask;
  } catch (error) {
    console.warn("Leads Server Offline. Toggling task locally.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        let updatedTask = null;

        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            const updatedTasks = l.tasks.map(t => {
              if (t.id === taskId) {
                updatedTask = { ...t, completed: !t.completed };
                return updatedTask;
              }
              return t;
            });
            return { ...l, tasks: updatedTasks };
          }
          return l;
        });

        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
        return updatedTask;
      } catch (e) {
        console.error("Failed to toggle task offline", e);
      }
    }
    throw error;
  }
};

/**
 * Remove Checklist Task from Lead
 */
export const deleteTask = async (leadId, taskId) => {
  try {
    const response = await api.delete(`/leads/${leadId}/tasks/${taskId}`);

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, tasks: l.tasks.filter(t => t.id !== taskId && t._id !== taskId) };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
      } catch (e) {}
    }

    isLeadOffline = false;
    return response.data.data;
  } catch (error) {
    console.warn("Leads Server Offline. Removing task locally.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, tasks: l.tasks.filter(t => t.id !== taskId) };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
        return { id: taskId };
      } catch (e) {
        console.error("Failed to remove task offline", e);
      }
    }
    throw error;
  }
};

/**
 * Add a Communication Log to a Lead
 */
export const addLog = async (leadId, logData) => {
  try {
    const response = await api.post(`/leads/${leadId}/logs`, logData);
    const newLog = response.data.data;

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, logs: [newLog, ...(l.logs || [])] };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
      } catch (e) {}
    }

    isLeadOffline = false;
    return newLog;
  } catch (error) {
    console.warn("Leads Server Offline. Logging activity locally.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const tempId = `log_local_${Date.now()}`;
        const newLog = {
          id: tempId,
          date: new Date().toISOString().split("T")[0],
          type: logData.type || "Call",
          subject: logData.subject,
          summary: logData.summary,
          contactPerson: logData.contactPerson || "Representative"
        };

        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, logs: [newLog, ...(l.logs || [])] };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));

        return newLog;
      } catch (e) {
        console.error("Failed to add activity log offline", e);
      }
    }
    throw error;
  }
};

/**
 * Delete a Communication Log
 */
export const deleteLog = async (leadId, logId) => {
  try {
    const response = await api.delete(`/leads/${leadId}/logs/${logId}`);

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, logs: l.logs.filter(log => log.id !== logId && log._id !== logId) };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
      } catch (e) {}
    }

    isLeadOffline = false;
    return response.data.data;
  } catch (error) {
    console.warn("Leads Server Offline. Deleting activity log locally.", error.message);
    isLeadOffline = true;

    const cachedData = localStorage.getItem("crm_leads_data");
    if (cachedData) {
      try {
        const localList = JSON.parse(cachedData);
        const updatedList = localList.map(l => {
          if (l._id === leadId) {
            return { ...l, logs: l.logs.filter(log => log.id !== logId) };
          }
          return l;
        });
        localStorage.setItem("crm_leads_data", JSON.stringify(updatedList));
        return { id: logId };
      } catch (e) {
        console.error("Failed to delete activity log offline", e);
      }
    }
    throw error;
  }
};
