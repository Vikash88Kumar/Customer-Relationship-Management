import React from "react";
import { Search, SlidersHorizontal, Settings2, Shield, Ruler, Clock, Tag, Plus, X, FileCheck } from "lucide-react";
import "./Catalog.css";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");

  // Load products from localStorage or fall back to robust defaults
  const [products, setProducts] = React.useState(() => {
    const localProds = localStorage.getItem("crm_catalog_data");
    if (localProds) {
      try {
        return JSON.parse(localProds);
      } catch (e) {
        console.error("Error parsing local products data", e);
      }
    }
    return [
      {
        _id: "prod_1",
        sku: "TI-FAST-01",
        name: "Grade 5 Titanium M12 Fasteners",
        description: "High-tensile strength fasteners optimized for extreme aerospace environments and engine assemblies.",
        category: "Fasteners & Hardware",
        unitOfMeasure: "pcs",
        basePrice: 1250,
        specifications: {
          dimensions: "M12 x 50mm",
          material: "Ti-6Al-4V Grade 5",
          tolerance: "+/- 0.01mm",
          weightKg: 0.045
        },
        leadTimeDays: 7,
        isCustomizable: true,
        isActive: true
      },
      {
        _id: "prod_2",
        sku: "AL-PLATE-06",
        name: "Aluminium 6061-T6 Precision Sheets",
        description: "Structural alloy sheet stock with exceptional corrosion resistance and mechanical properties.",
        category: "Raw Materials",
        unitOfMeasure: "sheets",
        basePrice: 4800,
        specifications: {
          dimensions: "1200mm x 2400mm x 6mm",
          material: "Aluminium 6061-T6",
          tolerance: "+/- 0.05mm",
          weightKg: 46.8
        },
        leadTimeDays: 5,
        isCustomizable: false,
        isActive: true
      },
      {
        _id: "prod_3",
        sku: "IN-PIN-718",
        name: "Inconel 718 Custom Turbine Pins",
        description: "Superalloy custom fabricated fasteners designed to withstand severe heat and pressure environments.",
        category: "Custom Manufactured Parts",
        unitOfMeasure: "pcs",
        basePrice: 8500,
        specifications: {
          dimensions: "22mm Diameter x 110mm",
          material: "Inconel 718 Superalloy",
          tolerance: "+/- 0.002mm",
          weightKg: 0.35
        },
        leadTimeDays: 18,
        isCustomizable: true,
        isActive: true
      },
      {
        _id: "prod_4",
        sku: "FE-BOLT-4140",
        name: "AISI 4140 Anchor Bolts M36",
        description: "High durability carbon alloy structural bolts for structural foundation anchors.",
        category: "Fasteners & Hardware",
        unitOfMeasure: "pcs",
        basePrice: 2200,
        specifications: {
          dimensions: "M36 x 350mm",
          material: "AISI 4140 Steel",
          tolerance: "+/- 0.10mm",
          weightKg: 3.12
        },
        leadTimeDays: 6,
        isCustomizable: false,
        isActive: true
      },
      {
        _id: "prod_5",
        sku: "DIE-CARB-99",
        name: "Tungsten Carbide Tooling Dies",
        description: "Heavy-duty forming dies made of pure tungsten carbide for metal punching presses.",
        category: "Tooling & Dies",
        unitOfMeasure: "pcs",
        basePrice: 38000,
        specifications: {
          dimensions: "180mm x 180mm x 40mm",
          material: "Tungsten Carbide",
          tolerance: "+/- 0.005mm",
          weightKg: 12.4
        },
        leadTimeDays: 25,
        isCustomizable: true,
        isActive: true
      }
    ];
  });

  // Sync products to local storage
  React.useEffect(() => {
    localStorage.setItem("crm_catalog_data", JSON.stringify(products));
  }, [products]);

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
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !basePrice || !material.trim()) return;

    const uppercaseSku = sku.toUpperCase().trim();
    const isDuplicate = products.some(p => p.sku.toUpperCase() === uppercaseSku);
    if (isDuplicate) {
      setErrorMsg(`SKU code "${uppercaseSku}" already exists in the catalog.`);
      return;
    }

    const newProd = {
      _id: `prod_${Date.now()}`,
      sku: uppercaseSku,
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
      isCustomizable,
      isActive: true
    };

    setProducts([newProd, ...products]);
    handleCloseModal();
  };

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.specifications.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      <div className="catalog-grid">
        {filteredProducts.map((prod) => (
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
        {filteredProducts.length === 0 && (
          <div className="catalog-empty-search-notice" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
            No products matching search parameters.
          </div>
        )}
      </div>

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
