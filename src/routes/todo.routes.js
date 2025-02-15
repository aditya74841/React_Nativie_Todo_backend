import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodayTasks,
  updateTaskStatus,
  updateTodayTodo,
} from "../controller/todo.controller.js";

const router = Router();

router.route("/create-todo").post(createTodo);
router.route("/get-todo").get(getTodayTasks);
router.route("/update-todo-status/:taskId").patch(updateTaskStatus);
router.route("/update-today-todo").get(updateTodayTodo);

router.route("/delete-todo/:taskId").delete(deleteTodo);

export default router;
