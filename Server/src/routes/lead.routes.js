import { Router } from "express";
import { verifyJwt, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  addTask,
  toggleTask,
  deleteTask,
  addLog,
  deleteLog
} from "../controllers/lead.controller.js";

const router = Router();

// Apply JWT verification globally to all Lead endpoints
router.use(verifyJwt);

router.route("/")
  .get(getLeads)
  .post(createLead);

router.route("/:id")
  .put(updateLead)
  .delete(authorizeRoles("Admin", "BDA_Manager"), deleteLead);

router.route("/:id/tasks")
  .post(addTask);

router.route("/:id/tasks/:taskId")
  .put(toggleTask)
  .delete(deleteTask);

router.route("/:id/logs")
  .post(addLog);

router.route("/:id/logs/:logId")
  .delete(deleteLog);

export default router;
