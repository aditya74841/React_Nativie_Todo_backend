import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodo,
  updateTaskStatus,
} from "../controller/todo.controller.js";

const router = Router();

router.route("/create-todo").post(createTodo);
router.route("/get-todo/:date").get(getTodo);
router.route("/update-todo-status/:taskId").patch(updateTaskStatus);

router.route("/delete-todo/:taskId").delete(deleteTodo  );

export default router;
