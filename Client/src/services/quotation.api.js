import api from "../api/axios.js";

// Export reactive tracker for offline mode status specific to quotations
export let isQuotationOffline = false;

/**
 * Get B2B Quotations Registry
 * Fetches commercial quotes from server database with self-healing offline cache fallback.
 */
export const getQuotations = async () => {
  try {
    const response = await api.get("/quotations");
    const serverQuotes = response.data.data || [];
    
    // Save to local cache
    localStorage.setItem("crm_quotes_data", JSON.stringify(serverQuotes));
    isQuotationOffline = false;
    
    return serverQuotes;
  } catch (error) {
    console.warn("Quotations Server Offline. Falling back to local storage cache.", error.message);
    isQuotationOffline = true;
    
    const cachedData = localStorage.getItem("crm_quotes_data");
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error("Failed to parse cached quotes data", e);
      }
    }
    return []; // Return empty array if cache isn't initialized yet
  }
};

/**
 * Register New Quotation Draft
 * Saves quotation to server. On offline error, caches locally.
 */
export const createQuotation = async (quotationData) => {
  try {
    const response = await api.post("/quotations", quotationData);
    const created = response.data.data;

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_quotes_data");
    if (cachedData) {
      try {
        const localQuotes = JSON.parse(cachedData);
        localStorage.setItem("crm_quotes_data", JSON.stringify([created, ...localQuotes]));
      } catch (e) {}
    }

    isQuotationOffline = false;
    return created;
  } catch (error) {
    console.warn("Quotations Server Offline. Persisting quote locally in offline cache.", error.message);
    isQuotationOffline = true;

    // Cache locally offline
    const cachedData = localStorage.getItem("crm_quotes_data");
    let localQuotes = [];
    if (cachedData) {
      try {
        localQuotes = JSON.parse(cachedData);
      } catch (e) {
        console.error("Failed to parse cached quotes data", e);
      }
    }

    const localNewQuote = {
      ...quotationData,
      _id: `quote_local_${Date.now()}`,
      quotationNumber: quotationData.quotationNumber || `QT-2026-0${Math.floor(Math.random() * 90) + 10}`,
      revisionNumber: 0,
      bda: quotationData.bda || "Local Associate",
      subtotal: quotationData.subtotal,
      tax: quotationData.tax,
      totalPrice: quotationData.totalPrice,
      validityDays: quotationData.validityDays || 30,
      expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
      history: [
        {
          revision: 0,
          revisedBy: quotationData.bda || "Local Associate",
          revisedAt: new Date().toISOString().split("T")[0],
          reason: "Initial custom build draft registered locally offline."
        }
      ]
    };

    const updatedList = [localNewQuote, ...localQuotes];
    localStorage.setItem("crm_quotes_data", JSON.stringify(updatedList));

    return localNewQuote;
  }
};

/**
 * Update/Revise Quotation in database
 */
export const updateQuotation = async (id, quotationData) => {
  try {
    const response = await api.put(`/quotations/${id}`, quotationData);
    const updated = response.data.data;

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_quotes_data");
    if (cachedData) {
      try {
        const localQuotes = JSON.parse(cachedData);
        const updatedList = localQuotes.map(q => q._id === id ? updated : q);
        localStorage.setItem("crm_quotes_data", JSON.stringify(updatedList));
      } catch (e) {}
    }

    isQuotationOffline = false;
    return updated;
  } catch (error) {
    console.warn("Quotations Server Offline. Saving revision locally.", error.message);
    isQuotationOffline = true;

    // Perform local offline revision tracking
    const cachedData = localStorage.getItem("crm_quotes_data");
    if (cachedData) {
      try {
        const localQuotes = JSON.parse(cachedData);
        const updatedList = localQuotes.map(q => {
          if (q._id === id) {
            // Case A: Pure Status Promotion
            if (quotationData.status && !quotationData.items) {
              return {
                ...q,
                status: quotationData.status,
                history: [
                  ...q.history,
                  {
                    revision: q.revisionNumber,
                    revisedBy: q.bda || "Local Associate",
                    revisedAt: new Date().toISOString().split("T")[0],
                    reason: `Promoted quotation status to ${quotationData.status.replace(/_/g, ' ')} locally.`
                  }
                ]
              };
            }
            // Case B: Full Technical/Commercial Revision
            const nextRev = q.revisionNumber + 1;
            return {
              ...q,
              revisionNumber: nextRev,
              items: quotationData.items,
              subtotal: quotationData.subtotal,
              discount: quotationData.discount,
              tax: quotationData.tax,
              totalPrice: quotationData.totalPrice,
              paymentTerms: quotationData.paymentTerms,
              shippingTerms: quotationData.shippingTerms,
              status: "Revised",
              history: [
                ...q.history,
                {
                  revision: nextRev,
                  revisedBy: q.bda || "Local Associate",
                  revisedAt: new Date().toISOString().split("T")[0],
                  reason: quotationData.reason || "Revised specifications and pricing offline."
                }
              ]
            };
          }
          return q;
        });

        localStorage.setItem("crm_quotes_data", JSON.stringify(updatedList));
        return updatedList.find(q => q._id === id);
      } catch (e) {
        console.error("Offline revision update failed:", e);
      }
    }
    throw error;
  }
};

/**
 * Delete B2B Quotation from registry
 */
export const deleteQuotation = async (id) => {
  try {
    const response = await api.delete(`/quotations/${id}`);

    // Synchronize local cache immediately
    const cachedData = localStorage.getItem("crm_quotes_data");
    if (cachedData) {
      try {
        const localQuotes = JSON.parse(cachedData);
        const filtered = localQuotes.filter(q => q._id !== id);
        localStorage.setItem("crm_quotes_data", JSON.stringify(filtered));
      } catch (e) {}
    }

    isQuotationOffline = false;
    return response.data.data;
  } catch (error) {
    console.warn("Quotations Server Offline. Deleting local cached record.", error.message);
    isQuotationOffline = true;

    const cachedData = localStorage.getItem("crm_quotes_data");
    if (cachedData) {
      try {
        const localQuotes = JSON.parse(cachedData);
        const filtered = localQuotes.filter(q => q._id !== id);
        localStorage.setItem("crm_quotes_data", JSON.stringify(filtered));
        return { id };
      } catch (e) {
        console.error("Offline deletion failed:", e);
      }
    }
    throw error;
  }
};
