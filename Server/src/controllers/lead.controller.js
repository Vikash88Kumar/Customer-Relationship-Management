import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Lead } from "../models/lead.model.js";
import { Task } from "../models/task.model.js";
import { CommunicationLog } from "../models/communicationLog.model.js";
import { AuditLog } from "../models/auditLog.model.js";

/**
 * Helper: Write a quick compliance audit log
 */
const writeAuditLog = async (userId, actionType, details, ipAddress = "127.0.0.1") => {
  try {
    await AuditLog.create({
      userId,
      actionType,
      details,
      ipAddress,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Audit log creation failed:", err);
  }
};

/**
 * Get All B2B Leads
 * Returns a list of all leads, populating assigned BDA, related tasks, and communication logs.
 */
export const getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find().populate("assignedBDA", "name email avatar role");

  const leadIds = leads.map(l => l._id);

  // Fetch all associated tasks
  const tasks = await Task.find({ leadId: { $in: leadIds } });

  // Fetch all associated communication logs
  const logs = await CommunicationLog.find({ leadId: { $in: leadIds } })
    .populate("bdaId", "name email")
    .sort({ dateTime: -1 });

  // Merge tasks and logs into respective leads
  const formattedLeads = leads.map(lead => {
    const leadTasks = tasks
      .filter(t => t.leadId.toString() === lead._id.toString())
      .map(t => ({
        id: t._id,
        label: t.title,
        completed: t.status === "Completed"
      }));

    const leadLogs = logs
      .filter(log => log.leadId.toString() === lead._id.toString())
      .map(log => ({
        id: log._id,
        date: log.dateTime.toISOString().split("T")[0],
        type: log.type,
        subject: log.subject,
        summary: log.summary,
        contactPerson: log.contactPerson
      }));

    return {
      ...lead.toObject(),
      tasks: leadTasks,
      logs: leadLogs
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formattedLeads, "Leads and pipelines data loaded successfully"));
});

/**
 * Create a B2B Lead
 */
export const createLead = asyncHandler(async (req, res) => {
  const {
    companyName,
    industry,
    companySize,
    annualRevenue,
    address,
    contacts,
    source,
    leadScore,
    customFields
  } = req.body;

  if (!companyName || !contacts || contacts.length === 0) {
    throw new ApiError(400, "Company name and primary contact are required");
  }

  // Set default BDA assignment to current user if BDA role
  const assignedBDA = req.user ? req.user._id : null;

  const newLead = await Lead.create({
    companyName,
    industry,
    companySize,
    annualRevenue,
    address: address || { city: "Unknown", country: "India" },
    contacts,
    source: source || "Website Inbound",
    leadScore: leadScore || 50,
    customFields: customFields || {},
    assignedBDA
  });

  // Create initial tasks
  await Task.create([
    {
      title: "Complete initial requirements review call",
      description: `Evaluate B2B requirements for ${companyName}`,
      type: "Call",
      leadId: newLead._id,
      assignedTo: req.user._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: "Pending"
    },
    {
      title: "Create catalog parts matching checklist",
      description: `Establish specs map for ${companyName}`,
      type: "Prepare Quote",
      leadId: newLead._id,
      assignedTo: req.user._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: "Pending"
    }
  ]);

  // Log audit operation
  if (req.user) {
    await writeAuditLog(
      req.user._id,
      "LEAD_CREATION",
      `Created new B2B Lead for ${companyName} (${industry}) with annual potential ₹${annualRevenue?.toLocaleString("en-IN")}`
    );
  }

  // Return full lead structure
  const tasks = await Task.find({ leadId: newLead._id });
  const populatedLead = await Lead.findById(newLead._id).populate("assignedBDA", "name email avatar role");
  const formattedLead = {
    ...(populatedLead ? populatedLead.toObject() : newLead.toObject()),
    tasks: tasks.map(t => ({ id: t._id, label: t.title, completed: false })),
    logs: []
  };

  return res
    .status(201)
    .json(new ApiResponse(201, formattedLead, "B2B Corporate Lead registered successfully"));
});

/**
 * Update a Lead (Including status pipeline changes)
 */
export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Detect status change for audit log
  const statusChanged = updateData.status && updateData.status !== lead.status;
  const oldStatus = lead.status;

  // Update lead
  const updatedLead = await Lead.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate("assignedBDA", "name email avatar role");

  if (statusChanged && req.user) {
    await writeAuditLog(
      req.user._id,
      "LEAD_STATUS_UPDATE",
      `Shifted ${lead.companyName} pipeline stage from ${oldStatus} ➔ ${updateData.status}`
    );
  }

  // Fetch updated tasks and logs
  const tasks = await Task.find({ leadId: id });
  const logs = await CommunicationLog.find({ leadId: id }).sort({ dateTime: -1 });

  const formattedLead = {
    ...updatedLead.toObject(),
    tasks: tasks.map(t => ({ id: t._id, label: t.title, completed: t.status === "Completed" })),
    logs: logs.map(l => ({
      id: l._id,
      date: l.dateTime.toISOString().split("T")[0],
      type: l.type,
      subject: l.subject,
      summary: l.summary,
      contactPerson: l.contactPerson
    }))
  };

  return res
    .status(200)
    .json(new ApiResponse(200, formattedLead, "Lead record updated successfully"));
});

/**
 * Delete a Lead
 */
export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  await Lead.findByIdAndDelete(id);
  // Also clean up associated tasks and logs
  await Task.deleteMany({ leadId: id });
  await CommunicationLog.deleteMany({ leadId: id });

  if (req.user) {
    await writeAuditLog(
      req.user._id,
      "LEAD_DELETION",
      `Permanently purged Lead records for ${lead.companyName}`
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Lead and associated history purged successfully"));
});

/**
 * Add a Task to a Lead
 */
export const addTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;

  if (!label) {
    throw new ApiError(400, "Task title label is required");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  const newTask = await Task.create({
    title: label,
    type: "Follow-up",
    leadId: id,
    assignedTo: req.user?._id || lead.assignedBDA || null,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days due
    status: "Pending"
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: newTask._id,
        label: newTask.title,
        completed: false
      },
      "Custom checklist task added successfully"
    )
  );
});

/**
 * Toggle Task Completion
 */
export const toggleTask = asyncHandler(async (req, res) => {
  const { id, taskId } = req.params;

  const task = await Task.findOne({ _id: taskId, leadId: id });
  if (!task) {
    throw new ApiError(404, "Task not associated with this lead");
  }

  task.status = task.status === "Completed" ? "Pending" : "Completed";
  await task.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: task._id,
        label: task.title,
        completed: task.status === "Completed"
      },
      "Checklist task status updated"
    )
  );
});

/**
 * Delete a Task from a Lead
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const { id, taskId } = req.params;

  const task = await Task.findOneAndDelete({ _id: taskId, leadId: id });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id: taskId }, "Checklist task removed successfully"));
});

/**
 * Add a Communication Log to a Lead
 */
export const addLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, subject, summary } = req.body;

  if (!type || !subject || !summary) {
    throw new ApiError(400, "Communication type, subject, and summary are required");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Get primary contact name for log
  const contactPerson = lead.contacts.find(c => c.isPrimary)?.name || "Unknown Representative";

  const newLog = await CommunicationLog.create({
    leadId: id,
    bdaId: req.user?._id || lead.assignedBDA || null,
    contactPerson,
    type: type || "Call",
    direction: "Outbound",
    dateTime: new Date(),
    subject,
    summary,
    outcomes: "Logged conversation details"
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: newLog._id,
        date: newLog.dateTime.toISOString().split("T")[0],
        type: newLog.type,
        subject: newLog.subject,
        summary: newLog.summary,
        contactPerson
      },
      "Communication activity logged successfully"
    )
  );
});

/**
 * Delete a Communication Log
 */
export const deleteLog = asyncHandler(async (req, res) => {
  const { id, logId } = req.params;

  const log = await CommunicationLog.findOneAndDelete({ _id: logId, leadId: id });
  if (!log) {
    throw new ApiError(404, "Communication log not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id: logId }, "Communication log deleted successfully"));
});
