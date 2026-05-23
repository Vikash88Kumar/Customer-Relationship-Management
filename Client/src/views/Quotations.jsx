import React from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  History, 
  CheckCircle, 
  AlertCircle,
  Truck,
  FileCheck,
  RefreshCw,
  PlusCircle,
  Minus,
  Upload,
  Download,
  Printer,
  X,
  CreditCard,
  Percent,
  Factory
} from "lucide-react";
import "./Quotations.css";

export default function Quotations({ user }) {
  const [activeQuotation, setActiveQuotation] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [catalogSearch, setCatalogSearch] = React.useState("");
  const [catalogCategory, setCatalogCategory] = React.useState("All");

  // Standard Product Catalog (SKUs) in Rupees (₹)
  const catalog = [
    { sku: "TI-FAST-01", name: "Grade 5 Titanium M12 Fasteners", basePrice: 1250, unitOfMeasure: "pcs", category: "Titanium" },
    { sku: "AL-PLATE-06", name: "Aluminium 6061-T6 Precision Sheets", basePrice: 4800, unitOfMeasure: "sheets", category: "Aluminium" },
    { sku: "IN-PIN-718", name: "Inconel 718 Custom Turbine Pins", basePrice: 8500, unitOfMeasure: "pcs", category: "Inconel" },
    { sku: "FE-BOLT-4140", name: "AISI 4140 Anchor Bolts M36", basePrice: 2200, unitOfMeasure: "pcs", category: "Steel" }
  ];

  // Load quotes from local storage or fall back to defaults
  const [quotes, setQuotes] = React.useState(() => {
    const localQuotes = localStorage.getItem("crm_quotes_data");
    if (localQuotes) {
      try {
        return JSON.parse(localQuotes);
      } catch (e) {
        console.error("Error parsing local quotes", e);
      }
    }
    return [
      {
        _id: "quote_1",
        quotationNumber: "QT-2026-081",
        revisionNumber: 1,
        customer: "Tata Motors Defence Division",
        bda: "Vikash Kumar",
        items: [
          { sku: "TI-FAST-01", name: "Grade 5 Titanium M12 Fasteners", quantity: 500, unitPrice: 1250, isCustom: true, customDetails: { tolerance: "+/- 0.005mm", material: "Ti-6Al-4V", drawingFile: "TATA-DEF-M12-V1.dwg" } },
          { sku: "AL-PLATE-06", name: "Aluminium 6061-T6 Precision Sheets", quantity: 50, unitPrice: 4500, isCustom: false }
        ],
        subtotal: 850000,
        discount: 25000,
        tax: 148500, // 18% standard GST
        totalPrice: 973500,
        paymentTerms: "50% Advance / 50% on Delivery",
        shippingTerms: "FOB Mumbai Port",
        status: "Client_Accepted",
        validityDays: 30,
        expiryDate: "2026-06-19",
        history: [
          { revision: 0, revisedBy: "Vikash Kumar", revisedAt: "2026-05-18", reason: "Initial draft submitted" },
          { revision: 1, revisedBy: "Vikash Kumar", revisedAt: "2026-05-20", reason: "Revised titanium quantity and applied bulk discount" }
        ]
      },
      {
        _id: "quote_2",
        quotationNumber: "QT-2026-082",
        revisionNumber: 0,
        customer: "Hindustan Aeronautics (HAL)",
        bda: "Vikash Kumar",
        items: [
          { sku: "IN-PIN-718", name: "Inconel 718 Custom Turbine Pins", quantity: 200, unitPrice: 8500, isCustom: true, customDetails: { tolerance: "+/- 0.002mm", drawingFile: "HAL-TURB-09.dwg" } }
        ],
        subtotal: 1700000,
        discount: 50000,
        tax: 297000,
        totalPrice: 1947000,
        paymentTerms: "Net 30",
        shippingTerms: "EXW Bengaluru Factory",
        status: "Sent_To_Client",
        validityDays: 15,
        expiryDate: "2026-06-03",
        history: [
          { revision: 0, revisedBy: "Vikash Kumar", revisedAt: "2026-05-19", reason: "Initial engineering drawing verified and pricing computed" }
        ]
      }
    ];
  });

  // Sync quotes to local storage
  React.useEffect(() => {
    localStorage.setItem("crm_quotes_data", JSON.stringify(quotes));
  }, [quotes]);

  // Pricing Builder State
  const [selectedCustomer, setSelectedCustomer] = React.useState("Tata Motors Defence Division");
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [discountVal, setDiscountVal] = React.useState(0);
  const [selectedPayment, setSelectedPayment] = React.useState("50% Advance / 50% on Delivery");
  const [selectedShipping, setSelectedShipping] = React.useState("EXW");

  // Mock blueprint uploading state for configured rows
  const [blueprintUploadProgress, setBlueprintUploadProgress] = React.useState({}); // row index -> progress (0 to 100)

  // PDF Print preview modal toggler
  const [showInvoicePrintPreview, setShowInvoicePrintPreview] = React.useState(false);
  const [revisingQuoteId, setRevisingQuoteId] = React.useState(null);

  // Filter Catalog items based on search and category tab
  const filteredCatalog = catalog.filter(prod => {
    const matchesSearch = prod.sku.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          prod.name.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = catalogCategory === "All" || prod.category === catalogCategory;
    return matchesSearch && matchesCategory;
  });

  // Add Item to constructor
  const handleAddItem = (sku) => {
    const prod = catalog.find(p => p.sku === sku);
    if (!prod) return;

    const isAdded = selectedItems.some(i => i.sku === sku);
    if (isAdded) return;

    const newItem = {
      sku: prod.sku,
      name: prod.name,
      quantity: 100,
      unitPrice: prod.basePrice,
      isCustom: false,
      customDetails: { tolerance: "", material: "", drawingFile: "" }
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  // Modify quantity, price, or details inline
  const updateItemField = (index, field, value) => {
    setSelectedItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        if (field === "quantity" || field === "unitPrice") {
          return { ...item, [field]: parseFloat(value) || 0 };
        }
        if (field === "isCustom") {
          return { ...item, [field]: value };
        }
        return item;
      }
      return item;
    }));
  };

  // Incrementor helpers for quantity
  const handleBumpQty = (index, direction) => {
    const step = 50;
    setSelectedItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const nextQty = Math.max(1, item.quantity + (direction === "up" ? step : -step));
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  // Simulated blueprint drawing uploader trigger
  const handleMockBlueprintUpload = (index, fileName) => {
    setBlueprintUploadProgress(prev => ({ ...prev, [index]: 10 }));
    
    const interval = setInterval(() => {
      setBlueprintUploadProgress(prev => {
        const current = prev[index] || 0;
        if (current >= 100) {
          clearInterval(interval);
          // Set uploaded file name to items spec
          setSelectedItems(prevItems => prevItems.map((itm, i) => {
            if (i === index) {
              return { 
                ...itm, 
                customDetails: { 
                  ...itm.customDetails, 
                  drawingFile: fileName || `SPEC-CAD-REV${Math.floor(Math.random() * 90) + 10}.dwg` 
                } 
              };
            }
            return itm;
          }));
          return { ...prev, [index]: 100 };
        }
        return { ...prev, [index]: current + 30 };
      });
    }, 150);
  };

  // Calculate pricing summary (Rupees ₹)
  const computeQuoteTotals = (items, disc) => {
    const sub = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = Math.round((sub - disc) * 0.18); // 18% standard GST
    const total = Math.max(0, sub - disc + tax);
    return { subtotal: sub, tax, totalPrice: total };
  };

  const totals = computeQuoteTotals(selectedItems, discountVal);

  // Submit quote to state (or save revision)
  const handleSaveQuotation = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    if (revisingQuoteId) {
      // Save Revision
      setQuotes(prevQuotes => prevQuotes.map(q => {
        if (q._id === revisingQuoteId) {
          const nextRev = q.revisionNumber + 1;
          const updated = {
            ...q,
            revisionNumber: nextRev,
            items: selectedItems,
            subtotal: totals.subtotal,
            discount: discountVal,
            tax: totals.tax,
            totalPrice: totals.totalPrice,
            paymentTerms: selectedPayment,
            shippingTerms: selectedShipping,
            status: "Revised",
            history: [
              ...q.history,
              { 
                revision: nextRev, 
                revisedBy: user.name, 
                revisedAt: new Date().toISOString().split("T")[0], 
                reason: "Revised technical specifications, quantity configurations, and commercial discount schedules." 
              }
            ]
          };
          if (activeQuotation && activeQuotation._id === revisingQuoteId) {
            setActiveQuotation(updated);
          }
          return updated;
        }
        return q;
      }));

      setIsCreating(false);
      setRevisingQuoteId(null);
      setSelectedItems([]);
      setDiscountVal(0);
      setBlueprintUploadProgress({});
      return;
    }

    // Save New Quote
    const newQuote = {
      _id: `quote_${Date.now()}`,
      quotationNumber: `QT-2026-0${Math.floor(Math.random() * 90) + 10}`,
      revisionNumber: 0,
      customer: selectedCustomer,
      bda: user.name,
      items: selectedItems,
      subtotal: totals.subtotal,
      discount: discountVal,
      tax: totals.tax,
      totalPrice: totals.totalPrice,
      paymentTerms: selectedPayment,
      shippingTerms: selectedShipping,
      status: "Draft",
      validityDays: 30,
      expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
      history: [
        { revision: 0, revisedBy: user.name, revisedAt: new Date().toISOString().split("T")[0], reason: "Initial custom build draft" }
      ]
    };

    setQuotes([newQuote, ...quotes]);
    setIsCreating(false);
    setSelectedItems([]);
    setDiscountVal(0);
    setBlueprintUploadProgress({});
  };

  // Promote Quote status through stage clicks
  const promoteQuoteStatus = (quoteId, nextStatus) => {
    setQuotes(prevQuotes => prevQuotes.map(q => {
      if (q._id === quoteId) {
        const updated = {
          ...q,
          status: nextStatus,
          history: [
            ...q.history,
            { 
              revision: q.revisionNumber, 
              revisedBy: user.name, 
              revisedAt: new Date().toISOString().split("T")[0], 
              reason: `Promoted quotation status to ${nextStatus.replace(/_/g, ' ')}` 
            }
          ]
        };
        if (activeQuotation && activeQuotation._id === quoteId) {
          setActiveQuotation(updated);
        }
        return updated;
      }
      return q;
    }));
  };

  // Trigger Quote Revision and pre-fill form constructor with previous values
  const handleStartRevision = (quote) => {
    setRevisingQuoteId(quote._id);
    setSelectedCustomer(quote.customer);
    setSelectedItems(quote.items.map(item => ({
      ...item,
      customDetails: item.customDetails ? { ...item.customDetails } : { tolerance: "", material: "", drawingFile: "" }
    })));
    setDiscountVal(quote.discount || 0);
    setSelectedPayment(quote.paymentTerms || "50% Advance / 50% on Delivery");
    setSelectedShipping(quote.shippingTerms || "EXW");
    setIsCreating(true);
  };

  // Categories list
  const categories = ["All", "Titanium", "Aluminium", "Inconel", "Steel"];

  // Quote Stages for Interactive Chevron progression
  const quoteStages = ["Draft", "Sent_To_Client", "Under_Negotiation", "Client_Accepted", "Lost"];

  return (
    <div className="quotations-view fade-in">
      {/* Creation Toggle Bar */}
      <div className="quotes-controls glass-panel">
        <div className="section-title">
          <h3>Precision B2B Commercial Quotes</h3>
          <p>Configure custom-engineered quotes, revision tracking, and legal Incoterms.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            if (isCreating) {
              setIsCreating(false);
              setRevisingQuoteId(null);
              setSelectedItems([]);
              setDiscountVal(0);
            } else {
              setIsCreating(true);
              setRevisingQuoteId(null);
              setSelectedItems([]);
              setDiscountVal(0);
            }
          }}
        >
          {isCreating ? "View Quotations Registry" : "Create Technical Quotation"}
        </button>
      </div>

      {isCreating ? (
        /* Redesigned Premium Quote Builder Split-Pane Panel */
        <div className="quote-builder-grid">
          
          {/* Split Pane Left: Form Details */}
          <form onSubmit={handleSaveQuotation} className="builder-form-card glass-panel fade-in">
            <h4 className="card-heading">
              {revisingQuoteId && activeQuotation
                ? `Revise Technical Quotation: ${activeQuotation.quotationNumber} (v${activeQuotation.revisionNumber} ➔ v${activeQuotation.revisionNumber + 1})`
                : "Industrial Quote Constructor"}
            </h4>
            
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Select Client Lead</label>
                <select 
                  value={selectedCustomer} 
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="builder-select"
                >
                  <option value="Tata Motors Defence Division">Tata Motors Defence Division</option>
                  <option value="Hindustan Aeronautics (HAL)">Hindustan Aeronautics (HAL)</option>
                  <option value="L&T Heavy Engineering">L&T Heavy Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Legal Incoterms (Shipping)</label>
                <select 
                  value={selectedShipping} 
                  onChange={(e) => setSelectedShipping(e.target.value)}
                  className="builder-select"
                >
                  <option value="EXW">EXW - Ex Works (Factory Gates)</option>
                  <option value="FOB Mumbai Port">FOB Mumbai - Free on Board</option>
                  <option value="CIF Kolkata Port">CIF Kolkata - Cost, Insur. & Freight</option>
                  <option value="DDP Destination">DDP - Delivered Duty Paid</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Payment Schedule Terms</label>
                <select 
                  value={selectedPayment} 
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="builder-select"
                >
                  <option value="100% Advance">100% Advance Payment</option>
                  <option value="50% Advance / 50% on Delivery">50% Advance / 50% on Delivery</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Net 90">Net 90 Days</option>
                </select>
              </div>

              <div className="form-group">
                <div className="discount-slider-header">
                  <label className="form-label">Commercial Discount (₹)</label>
                  <span className="slider-percentage-val">₹{discountVal.toLocaleString("en-IN")}</span>
                </div>
                <div className="discount-slider-group">
                  <input 
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={discountVal}
                    onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                    className="discount-slider-bar"
                  />
                  <input 
                    type="number" 
                    value={discountVal} 
                    onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 10000"
                    className="builder-number-input inline-disc-input"
                  />
                </div>
              </div>
            </div>

            {/* Catalog Item picker with searches and category tags */}
            <div className="items-selector-block">
              <div className="catalog-block-header">
                <h5>Select SKU from Product Catalog</h5>
                
                {/* Search SKU */}
                <div className="catalog-mini-search">
                  <Search size={12} className="search-icon-mini" />
                  <input 
                    type="text" 
                    placeholder="Search SKU..." 
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories Tabs Selector */}
              <div className="catalog-tabs-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`catalog-tab-btn ${catalogCategory === cat ? "active" : ""}`}
                    onClick={() => setCatalogCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="catalog-buttons-grid">
                {filteredCatalog.map(prod => (
                  <button 
                    key={prod.sku} 
                    type="button" 
                    className="btn btn-secondary catalog-item-btn card-lift"
                    onClick={() => handleAddItem(prod.sku)}
                  >
                    <PlusCircle size={14} className="add-icon" />
                    <div className="item-btn-desc">
                      <strong>{prod.sku}</strong>
                      <span>₹{prod.basePrice}/{prod.unitOfMeasure}</span>
                    </div>
                  </button>
                ))}
                {filteredCatalog.length === 0 && (
                  <div className="catalog-empty-search-notice">No catalog items matching search parameters.</div>
                )}
              </div>
            </div>

            {/* Configured lines list with quantity bump adjusters & CAD loaders */}
            <div className="configured-items-section">
              <h5>Configure Quotation Line Items</h5>
              {selectedItems.length === 0 ? (
                <div className="empty-items-desc">No products added. Click standard catalog SKUs above to configure.</div>
              ) : (
                <div className="builder-items-list">
                  {selectedItems.map((item, idx) => {
                    const uploadProgress = blueprintUploadProgress[idx] || 0;
                    return (
                      <div key={idx} className="builder-item-row fade-in">
                        <div className="item-row-header">
                          <strong>{item.sku} - {item.name}</strong>
                          <button 
                            type="button" 
                            className="delete-item-btn"
                            onClick={() => setSelectedItems(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="row-inputs-grid">
                          <div className="row-input-group">
                            <label>Quantity</label>
                            <div className="qty-quick-bump-controls">
                              <button 
                                type="button" 
                                className="qty-bump-btn"
                                onClick={() => handleBumpQty(idx, "down")}
                              >
                                <Minus size={10} />
                              </button>
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
                                min="1"
                                className="qty-field-input"
                              />
                              <button 
                                type="button" 
                                className="qty-bump-btn"
                                onClick={() => handleBumpQty(idx, "up")}
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>

                          <div className="row-input-group">
                            <label>Unit Price (₹)</label>
                            <input 
                              type="number" 
                              value={item.unitPrice} 
                              onChange={(e) => updateItemField(idx, "unitPrice", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="row-input-group checkbox-group">
                            <label className="is-custom-label">
                              <input 
                                type="checkbox" 
                                checked={item.isCustom}
                                onChange={(e) => updateItemField(idx, "isCustom", e.target.checked)}
                              />
                              Custom Specs
                            </label>
                          </div>
                        </div>

                        {/* Interactive Blueprint Mock Uploader */}
                        {item.isCustom && (
                          <div className="custom-specs-input-block fade-in">
                            <div className="specs-inputs-subgrid">
                              <div className="specs-sub-input">
                                <label>Custom Tolerances / Metallurgy Specs</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. +/- 0.002mm, Ti-6Al-4V"
                                  value={item.customDetails.tolerance}
                                  onChange={(e) => {
                                    const newDetails = { ...item.customDetails, tolerance: e.target.value };
                                    setSelectedItems(prev => prev.map((itm, i) => i === idx ? { ...itm, customDetails: newDetails } : itm));
                                  }}
                                  className="builder-spec-detail-input"
                                />
                              </div>

                              <div className="specs-uploader-sub">
                                <label>Engineering CAD Overlays (.DWG)</label>
                                
                                {item.customDetails.drawingFile ? (
                                  <div className="blueprint-uploaded-file-tag fade-in">
                                    <FileCheck size={12} className="uploaded-icon" />
                                    <span>{item.customDetails.drawingFile}</span>
                                    <button 
                                      type="button" 
                                      className="remove-blueprint-file"
                                      onClick={() => {
                                        setSelectedItems(prev => prev.map((itm, i) => i === idx ? { ...itm, customDetails: { ...itm.customDetails, drawingFile: "" } } : itm));
                                        setBlueprintUploadProgress(prev => ({ ...prev, [idx]: 0 }));
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : uploadProgress > 0 ? (
                                  <div className="blueprint-uploading-progress-wrap fade-in">
                                    <div className="progress-bar-labels">
                                      <span>Compiling specs...</span>
                                      <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="bar-track">
                                      <div className="bar-fill" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="blueprint-mock-drag-drop"
                                    onClick={() => handleMockBlueprintUpload(idx, `ROB-SPEC-${item.sku}-V1.dwg`)}
                                    title="Click to simulate blueprint file upload"
                                  >
                                    <Upload size={12} />
                                    <span>Upload engineering drawing</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary builder-submit-btn"
              disabled={selectedItems.length === 0}
            >
              <FileCheck size={14} /> {revisingQuoteId && activeQuotation ? `Finalize Revision & Register (v${activeQuotation.revisionNumber + 1})` : "Finalize Draft & Add to Registry"}
            </button>
          </form>

          {/* Split Pane Right: Financial Summary */}
          <div className="pricing-card glass-panel fade-in">
            <h4 className="card-heading">Financial Summary</h4>
            <div className="pricing-rows-wrap">
              <div className="pricing-row">
                <span>Items Subtotal</span>
                <strong>₹{totals.subtotal.toLocaleString("en-IN")}.00</strong>
              </div>

              <div className="pricing-row row-discount">
                <span>Negotiated Discount</span>
                <span>-₹{discountVal.toLocaleString("en-IN")}.00</span>
              </div>

              <div className="pricing-row">
                <span>GST (18% Sales Tax)</span>
                <strong>₹{totals.tax.toLocaleString("en-IN")}.00</strong>
              </div>

              <div className="pricing-divider" />

              <div className="pricing-row row-total">
                <span>Grand Total (INR)</span>
                <span className="text-gradient">₹{totals.totalPrice.toLocaleString("en-IN")}.00</span>
              </div>
            </div>

            <div className="audit-alert badge badge-info">
              <AlertCircle size={14} /> 18% standard GST will be auto-calculated over subtotal minus discount.
            </div>
          </div>

        </div>
      ) : (
        /* Registry list of existing Quotes */
        <div className="quotes-registry-layout fade-in">
          
          <div className="registry-table-card glass-panel">
            <table className="registry-table">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Revision</th>
                  <th>B2B Client</th>
                  <th>Payment Terms</th>
                  <th>Incoterms</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr 
                    key={q._id} 
                    className={`registry-row-hover ${activeQuotation?._id === q._id ? "row-selected" : ""}`}
                    onClick={() => setActiveQuotation(q)}
                  >
                    <td><strong>{q.quotationNumber}</strong></td>
                    <td><span className="badge badge-muted">v{q.revisionNumber}</span></td>
                    <td>{q.customer}</td>
                    <td>{q.paymentTerms}</td>
                    <td>{q.shippingTerms.split(" ")[0]}</td>
                    <td><strong>₹{q.totalPrice.toLocaleString("en-IN")}</strong></td>
                    <td>
                      <span className={`badge ${
                        q.status === "Client_Accepted" ? "badge-success" : 
                        q.status === "Revised" ? "badge-info" : 
                        q.status === "Expired" ? "badge-error" : 
                        "badge-warning"
                      }`}>{q.status.replace(/_/g, ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Side detailing Revision Panel */}
          {activeQuotation ? (
            <div className="quote-detail-panel glass-panel fade-in">
              <div className="panel-header">
                <div className="panel-title">
                  <h4>Quotation Details</h4>
                  <h3>{activeQuotation.quotationNumber} (v{activeQuotation.revisionNumber})</h3>
                </div>
                
                <div className="panel-actions-wrap">
                  {/* Generate B2B PDF Quotation simulator */}
                  <button 
                    className="btn btn-primary btn-small generate-pdf-btn"
                    onClick={() => setShowInvoicePrintPreview(true)}
                    title="Generate and print B2B PDF Quotation"
                  >
                    <FileText size={11} /> Generate PDF
                  </button>

                  <button 
                    className="btn btn-secondary btn-small revision-trigger-btn"
                    onClick={() => handleStartRevision(activeQuotation)}
                  >
                    <RefreshCw size={12} /> Revise Quote (v{activeQuotation.revisionNumber} ➔ v{activeQuotation.revisionNumber + 1})
                  </button>
                </div>
              </div>

              {/* Interactive Chevron quote status progression */}
              <div className="quote-detail-section">
                <h5>Quotation Status Progression Path</h5>
                <div className="quote-stage-chevron-tracker">
                  {quoteStages.map((stage) => {
                    const currentIndex = quoteStages.indexOf(activeQuotation.status);
                    const stepIndex = quoteStages.indexOf(stage);

                    let stepClass = "future";
                    if (activeQuotation.status === stage) {
                      stepClass = "active";
                    } else if (activeQuotation.status === "Lost" && stage === "Client_Accepted") {
                      stepClass = "future";
                    } else if (activeQuotation.status === "Client_Accepted" && stage === "Lost") {
                      stepClass = "future";
                    } else if (stepIndex < currentIndex) {
                      stepClass = "completed";
                    }

                    return (
                      <button
                        key={stage}
                        className={`quote-chevron-step ${stepClass}`}
                        onClick={() => promoteQuoteStatus(activeQuotation._id, stage)}
                        title={`Promote status to ${stage.replace(/_/g, ' ')}`}
                      >
                        {stage.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Items in Active Quote */}
              <div className="panel-section">
                <h5>Quoted Line Items</h5>
                <div className="panel-items-list">
                  {activeQuotation.items.map((item, idx) => (
                    <div key={idx} className="panel-item-row">
                      <div className="panel-item-desc">
                        <strong>{item.sku}</strong>
                        <span>{item.name}</span>
                        {item.isCustom && (
                          <div className="item-custom-tags-sub">
                            <span className="badge badge-success badge-small">Tolerance: {item.customDetails?.tolerance || "AS9100D Standard"}</span>
                            {item.customDetails?.drawingFile && (
                              <span className="badge badge-info badge-small">CAD: {item.customDetails.drawingFile}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="panel-item-math">
                        <strong>{item.quantity} x ₹{item.unitPrice}</strong>
                        <span>₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revision History timeline */}
              <div className="panel-section">
                <h5>Revision History Timeline</h5>
                <div className="revision-timeline">
                  {activeQuotation.history.map((hist, idx) => (
                    <div key={idx} className="rev-timeline-item">
                      <div className="rev-badge">
                        <History size={12} />
                      </div>
                      <div className="rev-content">
                        <div className="rev-meta">
                          <strong>Revision v{hist.revision}</strong>
                          <span>{hist.revisedAt}</span>
                        </div>
                        <p>{hist.reason}</p>
                        <span className="rev-by">Author: {hist.revisedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="quote-detail-panel-empty glass-panel fade-in">
              <FileText size={48} className="empty-panel-icon" />
              <h4>Select a Quotation</h4>
              <p>Click any row in the registry to inspect quoted items, pricing breakdowns, and historical engineering revisions.</p>
            </div>
          )}

        </div>
      )}

      {/* DYNAMIC SPECTACULAR INVOICE / PRINT PREVIEW MODAL */}
      {showInvoicePrintPreview && activeQuotation && (
        <div className="invoice-preview-modal-backdrop" onClick={() => setShowInvoicePrintPreview(false)}>
          <div className="invoice-preview-modal glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <div className="header-brand-block">
                <Printer size={18} className="printer-header-icon" />
                <h3>B2B Corporate Quotation PDF</h3>
              </div>
              <div className="header-modal-actions">
                <button 
                  className="btn btn-primary print-trigger-btn"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print Document
                </button>
                <button className="close-invoice-modal" onClick={() => setShowInvoicePrintPreview(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="invoice-print-viewport">
              <div className="print-invoice-sheet">
                
                {/* Header details */}
                <div className="sheet-top-row">
                  <div className="sheet-logo-area">
                    <Factory className="logo-icon-sheet" size={36} />
                    <div>
                      <h2>ForgeCRM Community</h2>
                      <span>B2B heavy metallurgy fabrication</span>
                    </div>
                  </div>
                  <div className="sheet-meta-area">
                    <h1>QUOTATION SHEET</h1>
                    <p>Quote Ref: <strong>{activeQuotation.quotationNumber}</strong></p>
                    <p>Revision: <strong>v{activeQuotation.revisionNumber}</strong></p>
                    <p>Date Generated: <strong>{new Date().toISOString().split("T")[0]}</strong></p>
                    <p>Valid Until: <strong>{activeQuotation.expiryDate}</strong></p>
                  </div>
                </div>

                <div className="sheet-parties-grid">
                  <div className="sheet-party-col">
                    <h3>SUPPLIER ORGANISATION</h3>
                    <strong>ForgeCRM Systems India</strong>
                    <span>102 Heavy Industrial Park</span>
                    <span>Wagholi Industrial Zone, Pune, India</span>
                    <span>Contact: sales.pune@forgecrm.com</span>
                  </div>

                  <div className="sheet-party-col">
                    <h3>CLIENT INTAKE</h3>
                    <strong>{activeQuotation.customer}</strong>
                    <span>Primary Procurement Assembly Division</span>
                    <span>Corporate Client Stakeholder Intakes</span>
                    <span>Assigned BDA: {activeQuotation.bda}</span>
                  </div>
                </div>

                {/* Shipping Terms */}
                <div className="sheet-clauses-strip">
                  <div className="clause-item">
                    <strong>Payment Schedule:</strong>
                    <span>{activeQuotation.paymentTerms}</span>
                  </div>
                  <div className="clause-item">
                    <strong>Shipping Incoterms:</strong>
                    <span>{activeQuotation.shippingTerms}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="sheet-table-wrap">
                  <table className="sheet-items-table">
                    <thead>
                      <tr>
                        <th>SKU Code</th>
                        <th>Product Specification Details</th>
                        <th>Qty</th>
                        <th>Unit Price (INR)</th>
                        <th>Total price (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeQuotation.items.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.sku}</strong></td>
                          <td>
                            <strong>{item.name}</strong>
                            {item.isCustom && (
                              <div className="sheet-custom-sub-desc">
                                Custom Specification Tolerance: {item.customDetails?.tolerance || "AS9100D Standard"}
                                {item.customDetails?.drawingFile && ` | CAD Overlays: ${item.customDetails.drawingFile}`}
                              </div>
                            )}
                          </td>
                          <td>{item.quantity}</td>
                          <td>₹{item.unitPrice.toLocaleString("en-IN")}.00</td>
                          <td><strong>₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}.00</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="sheet-pricing-summary-block">
                  <div className="summary-math-col">
                    <div className="math-row">
                      <span>Items Subtotal:</span>
                      <span>₹{activeQuotation.subtotal.toLocaleString("en-IN")}.00</span>
                    </div>
                    <div className="math-row row-disc-sub">
                      <span>Commercial Bulk Discount:</span>
                      <span>-₹{activeQuotation.discount.toLocaleString("en-IN")}.00</span>
                    </div>
                    <div className="math-row">
                      <span>GST sales tax (18% Standard):</span>
                      <span>₹{activeQuotation.tax.toLocaleString("en-IN")}.00</span>
                    </div>
                    <div className="pricing-divider" />
                    <div className="math-row row-grand-total">
                      <span>Grand Total Potential (INR):</span>
                      <span>₹{activeQuotation.totalPrice.toLocaleString("en-IN")}.00</span>
                    </div>
                  </div>
                </div>

                {/* Bank terms signature area */}
                <div className="sheet-bottom-signatures">
                  <div className="bank-details-box">
                    <h4>Bank Transfer Details</h4>
                    <p>Bank: <strong>HDFC Corporate Bank</strong></p>
                    <p>IFS Code: <strong>HDFC0001092</strong></p>
                    <p>A/C Number: <strong>50200084534433</strong></p>
                  </div>
                  <div className="signature-lines-box">
                    <div className="sign-blank-line" />
                    <span>Authorized Signature & Seal</span>
                    <strong>ForgeCRM Operations Division</strong>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
