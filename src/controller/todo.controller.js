import { Todo } from "../model/todo.model.js";

const createTodo = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTodo = await Todo.create({ title });

    if (!newTodo) {
      return res
        .status(500)
        .json({ message: "Something went wrong while saving todo" });
    }

    return res
      .status(201)
      .json({ message: "Todo created successfully", data: newTodo });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const getTodo = async (req, res) => {
  try {
    // console.log("The getTodo controller  running ");

    const Todos = await Todo.find();

    if (!Todos) {
      return res
        .status(500)
        .json({ message: "Something went wrong while finding todo" });
    }
    // console.log("The getTodo controller  running smoothly");
    return res
      .status(201)
      .json({ message: "Todo send successfully", data: Todos });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const updateTodo = async (req, res) => {
  try {
    const { todoId } = req.params;
  } catch (error) {}
};
export { createTodo, getTodo, updateTodo };
