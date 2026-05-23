import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
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

// All routes here require user authentication
router.use(verifyJwt);

router.route("/")
  .get(getLeads)
  .post(createLead);

router.route("/:id")
  .put(updateLead)
  .delete(deleteLead);

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
