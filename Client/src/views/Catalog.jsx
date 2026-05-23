import React from "react";
import { Search, SlidersHorizontal, Settings2, Shield, Ruler, Clock, Tag, Plus, X, FileCheck } from "lucide-react";
import { getProducts, createProduct, isOffline } from "../services/product.api.js";
import "./Catalog.css";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");

  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isOfflineMode, setIsOfflineMode] = React.useState(false);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts(categoryFilter, searchQuery);

      setProducts(data);
      // console.log(data);
      setIsOfflineMode(isOffline);
    } catch (e) {
      console.error("Failed to load catalog products", e);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Modal forms states
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [sku, setSku] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Raw Materials");
  const [unitOfMeasure, setUnitOfMeasure] = React.useState("pcs");
  const [basePrice, setBasePrice] = React.useState("");
  const [material, setMaterial] = React.useState("");
  const [dimensions, setDimensions] = React.useState("");
  const [tolerance, setTolerance] = React.useState("+/- 0.01mm");
  const [leadTimeDays, setLeadTimeDays] = React.useState(7);
  const [isCustomizable, setIsCustomizable] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSkuChange = (val) => {
    setSku(val);
    if (errorMsg) setErrorMsg("");
  };

  const handleCloseModal = () => {
    setSku("");
    setName("");
    setDescription("");
    setCategory("Raw Materials");
    setUnitOfMeasure("pcs");
    setBasePrice("");
    setMaterial("");
    setDimensions("");
    setTolerance("+/- 0.01mm");
    setLeadTimeDays(7);
    setIsCustomizable(false);
    setErrorMsg("");
    setShowAddModal(false);
  };

  // Submit product creation to list
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !basePrice || !material.trim()) return;

    const productPayload = {
      sku: sku.toUpperCase().trim(),
      name: name.trim(),
      description: description.trim() || "No product description provided.",
      category,
      unitOfMeasure,
      basePrice: parseFloat(basePrice) || 0,
      specifications: {
        dimensions: dimensions.trim() || "N/A",
        material: material.trim(),
        tolerance: tolerance.trim() || "AS9100D Standard",
        weightKg: 0.1
      },
      leadTimeDays: parseInt(leadTimeDays) || 7,
      isCustomizable
    };

    try {
      const created = await createProduct(productPayload);
      setProducts(prev => [created, ...prev]);
      setIsOfflineMode(isOffline);
      handleCloseModal();
    } catch (error) {
      setErrorMsg(error.message || "Failed to register product SKU on server.");
      setIsOfflineMode(isOffline);
    }
  };

  const displayProducts = products;

  return (
    <div className="catalog-view fade-in">
      {/* Search and Filters panel */}
      <div className="catalog-controls glass-panel">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by SKU, product name, alloys..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="control-filter">
            <SlidersHorizontal size={14} />
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Fasteners & Hardware">Fasteners & Hardware</option>
              <option value="Custom Manufactured Parts">Custom Manufactured Parts</option>
              <option value="Sub-Assemblies">Sub-Assemblies</option>
              <option value="Tooling & Dies">Tooling & Dies</option>
              <option value="Finished Goods">Finished Goods</option>
            </select>
          </div>

          {isOfflineMode && (
            <span className="badge" style={{ fontSize: "10px", padding: "6px 10px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "var(--accent-light)", borderRadius: "4px", fontWeight: "600" }}>
              ⚠️ Offline Mode
            </span>
          )}

          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Grid of Industrial products */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px", width: "100%", color: "var(--text-secondary)" }}>
          Loading products catalog...
        </div>
      ) : (
        <div className="catalog-grid">
          {Array.isArray(displayProducts) && displayProducts.map((prod) => (
            <div key={prod._id} className="product-card glass-panel card-lift">
              <div className="card-top-row">
                <span className="sku-tag">{prod.sku}</span>
                <span className="category-badge badge badge-muted">{prod.category}</span>
              </div>

            <div className="card-middle-content">
              <h4>{prod.name}</h4>
              <p className="prod-desc">{prod.description}</p>
            </div>

            {/* Specifications Details */}
            <div className="specs-collapsible">
              <div className="spec-bullet">
                <Shield size={12} className="spec-bullet-icon" />
                <span>Material: <strong>{prod.specifications.material}</strong></span>
              </div>
              <div className="spec-bullet">
                <Ruler size={12} className="spec-bullet-icon" />
                <span>Dimensions: <strong>{prod.specifications.dimensions}</strong></span>
              </div>
              <div className="spec-bullet">
                <Settings2 size={12} className="spec-bullet-icon" />
                <span>Tolerance: <strong>{prod.specifications.tolerance}</strong></span>
              </div>
              <div className="spec-bullet">
                <Clock size={12} className="spec-bullet-icon" />
                <span>Lead Time: <strong>{prod.leadTimeDays} Days</strong></span>
              </div>
            </div>

            {/* Bottom pricing row - Rupee Formatting (₹) */}
            <div className="card-pricing-footer">
              <div className="price-tag-wrap">
                <Tag size={12} className="tag-icon" />
                <div className="price-details">
                  <span className="base-price-title">Base Price</span>
                  <strong className="base-price-amount">₹{prod.basePrice.toLocaleString("en-IN")}<small>/{prod.unitOfMeasure}</small></strong>
                </div>
              </div>

              {prod.isCustomizable ? (
                <span className="customizable-indicator badge badge-success">MTO (Customizable)</span>
              ) : (
                <span className="customizable-indicator badge badge-info">Standard stock</span>
              )}
            </div>

            </div>
          ))}
          {displayProducts?.length === 0 && (
            <div className="catalog-empty-search-notice" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              No products matching search parameters.
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC DEREGISTRATION ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <div className="catalog-modal-backdrop" onClick={handleCloseModal}>
          <div className="catalog-modal glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-modal-header">
              <div className="catalog-modal-title-block">
                <Tag size={18} className="catalog-modal-header-icon" />
                <h3>Add New Catalog Product SKU</h3>
              </div>
              <button className="catalog-close-modal-btn" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="catalog-modal-form-body">
              {errorMsg && (
                <div className="catalog-error-banner" style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  flexShrink: 0
                }}>
                  <span>⚠️</span> {errorMsg}
                </div>
              )}
              <div className="catalog-modal-form-grid">
                <div className="form-group">
                  <label className="form-label">SKU Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TI-FAST-02" 
                    value={sku} 
                    onChange={(e) => handleSkuChange(e.target.value)}
                    className="catalog-modal-input"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Grade 5 Titanium M16 Fasteners" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="catalog-modal-input"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="catalog-modal-input"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Fasteners & Hardware">Fasteners & Hardware</option>
                    <option value="Custom Manufactured Parts">Custom Manufactured Parts</option>
                    <option value="Sub-Assemblies">Sub-Assemblies</option>
                    <option value="Tooling & Dies">Tooling & Dies</option>
                    <option value="Finished Goods">Finished Goods</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1500" 
                    value={basePrice} 
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="catalog-modal-input"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit of Measure *</label>
                  <select 
                    value={unitOfMeasure} 
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="catalog-modal-input"
                  >
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="m">m (Meters)</option>
                    <option value="liters">liters (Liters)</option>
                    <option value="tons">tons (Tons)</option>
                    <option value="boxes">boxes (Boxes)</option>
                    <option value="sheets">sheets (Sheets)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturing Lead Time (Days)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 7" 
                    value={leadTimeDays} 
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="catalog-modal-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Material Spec *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ti-6Al-4V" 
                    value={material} 
                    onChange={(e) => setMaterial(e.target.value)}
                    className="catalog-modal-input"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dimensions Spec</label>
                  <input 
                    type="text" 
                    placeholder="e.g. M16 x 75mm" 
                    value={dimensions} 
                    onChange={(e) => setDimensions(e.target.value)}
                    className="catalog-modal-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tolerance Spec</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +/- 0.005mm" 
                    value={tolerance} 
                    onChange={(e) => setTolerance(e.target.value)}
                    className="catalog-modal-input"
                  />
                </div>

                <div className="form-group">
                  <label className="catalog-checkbox-group" style={{ marginTop: "24px" }}>
                    <input 
                      type="checkbox" 
                      checked={isCustomizable} 
                      onChange={(e) => setIsCustomizable(e.target.checked)}
                    />
                    Made to Order (MTO)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea 
                  placeholder="Provide technical specifications and aerospace/metallurgical certifications details..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="catalog-modal-textarea"
                />
              </div>

              <div className="catalog-modal-actions-bar">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FileCheck size={16} /> Register Product SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
