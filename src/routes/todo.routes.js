import { Router } from "express";
import { createTodo, getTodo } from "../controller/todo.controller.js";

const router = Router();

router.route("/create-todo").post(createTodo);
router.route("/get-todo").get(getTodo);



export default router;
