import api from "../api/axios.js";

// Export reactive tracker for offline mode status
export let isOffline = false;

/**
 * Get Catalog Products List
 * Integrates with self-healing, offline-first localStorage cache fallbacks.
 */
export const getProducts = async (category = "All", search = "") => {
  try {
    const response = await api.get("/products", { params: { category, search } });
    const serverProducts = response.data.data || [];
    
    // Warm/update local catalog cache
    localStorage.setItem("crm_catalog_data", JSON.stringify(serverProducts));
    isOffline = false;
    
    return serverProducts;
  } catch (error) {
    console.warn("Catalog Server Offline. Falling back to client-side localStorage inventory cache.", error.message);
    isOffline = true;
    
    const cachedData = localStorage.getItem("crm_catalog_data");
    if (cachedData) {
      try {
        const localProducts = JSON.parse(cachedData);
        // Apply robust client-side filtering and matching
        return localProducts.filter(p => {
          const matchesCat = category === "All" || p.category === category;
          const matchesSearch = !search || 
            (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
            (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
            (p.specifications?.material && p.specifications.material.toLowerCase().includes(search.toLowerCase()));
          return matchesCat && matchesSearch;
        });
      } catch (e) {
        console.error("Failed to parse cached catalog data", e);
      }
    }
    return []; // Return empty list if cache isn't initialized yet
  }
};

/**
 * Register New Product SKU
 * Performs local SKU duplicate validation and caches requests during offline failovers.
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post("/products", productData);
    isOffline = false;
    return response.data.data;
  } catch (error) {
    console.warn("Catalog Server Offline. Persisting SKU locally in offline cache.", error.message);
    isOffline = true;
    
    const cachedData = localStorage.getItem("crm_catalog_data");
    let localList = [];
    if (cachedData) {
      try {
        localList = JSON.parse(cachedData);
      } catch (e) {
        console.error("Failed to parse cached catalog data for product creation", e);
      }
    }
    
    // Normalize SKU and safeguard against duplicate inventory codes offline
    const normalizedSku = productData.sku.toUpperCase().trim();
    const isDuplicate = localList.some(p => p.sku && p.sku.toUpperCase() === normalizedSku);
    if (isDuplicate) {
      throw new Error(`Duplicate Entry: A manufacturing product SKU with the code "${normalizedSku}" already exists.`);
    }
    
    // Construct local mock B2B catalog product
    const localNewProduct = {
      ...productData,
      _id: `local_prod_${Date.now()}`,
      sku: normalizedSku,
      isActive: true,
      specifications: {
        dimensions: productData.specifications?.dimensions || "N/A",
        material: productData.specifications?.material || "N/A",
        tolerance: productData.specifications?.tolerance || "AS9100D Standard",
        weightKg: parseFloat(productData.specifications?.weightKg) || 0.1
      }
    };
    
    const updatedList = [localNewProduct, ...localList];
    localStorage.setItem("crm_catalog_data", JSON.stringify(updatedList));
    
    return localNewProduct;
  }
};