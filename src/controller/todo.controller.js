import { Todo } from "../model/todo.model.js";

const createTodo = async (req, res) => {
  try {
    const { title, description, date, repeat } = req.body;

    // console.log("Create todo controller first console is running ");
    // Validate input
    if (!title || !date) {
      return res.status(400).json({ error: "Title and Date are required." });
    }

    const newTask = {
      title,
      description,
      date: new Date(date), // Convert to Date format
      repeat,
      completionHistory: [],
    };

    console.log("The new Task is ", newTask);
    // Check if calendar exists (Assuming single calendar for now)
    let calendar = await Todo.findOne();

    // console.log("The Calendar is ", newTask);
    if (!calendar) {
      calendar = new Todo({ tasks: [newTask] });
    } else {
      calendar.tasks.push(newTask);
    }

    await calendar.save();
    // console.log("Create todo controller last console is running ");

    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

const getTodo = async (req, res) => {
  try {
    const { date } = req.params;
    const selectedDate = new Date(date);

    const calendars = await Todo.find().populate("tasks"); // Fetch all calendars with tasks

    let pendingTasks = [];

    calendars.forEach((calendar) => {
      calendar.tasks.forEach((task) => {
        const isTaskRepeating =
          task.repeat !== "none" && task.date <= selectedDate;
        const isCompletedOnDate = task.completionHistory.some(
          (entry) =>
            entry.date.toISOString().split("T")[0] ===
            selectedDate.toISOString().split("T")[0]
        );

        if (
          task.date.toISOString().split("T")[0] ===
            selectedDate.toISOString().split("T")[0] ||
          (isTaskRepeating && !isCompletedOnDate)
        ) {
          pendingTasks.push({
            title: task.title,
            repeat: task.repeat,
            status: isCompletedOnDate ? "Completed" : "Pending",
            description: task.description,
          });
        }
        // console.log("Checking the get Todo");
      });
    });

    res.json(pendingTasks);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // Expecting status update (e.g., "Completed" or "Pending")

    if (!taskId || !status) {
      return res.status(400).json({ error: "Task ID and status are required." });
    }

    // Find the task inside the Todo collection
    const calendar = await Todo.findOne({ "tasks._id": taskId });

    if (!calendar) {
      return res.status(404).json({ error: "No tasks found." });
    }

    console.log("The Update Task is ", taskId, status);

    // Find the specific task
    const task = calendar.tasks.find((task) => task._id.toString() === taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Update task status
    task.status = status;

    // If the status is "Completed", add the current date to completion history
    if (status.toLowerCase() === "completed") {
      task.completionHistory.push({
        date: new Date(),
        completedAt: new Date(),
      });
    }

    await calendar.save();

    res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required." });
    }

    // Find the calendar
    let calendar = await Todo.findOne();

    if (!calendar) {
      return res.status(404).json({ error: "No tasks found." });
    }

    // Filter out the task with the given ID
    const updatedTasks = calendar.tasks.filter(
      (task) => task._id.toString() !== taskId
    );

    // Check if task existed
    if (updatedTasks.length === calendar.tasks.length) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Update and save the calendar
    calendar.tasks = updatedTasks;
    await calendar.save();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export { createTodo, getTodo, deleteTodo, updateTaskStatus };
