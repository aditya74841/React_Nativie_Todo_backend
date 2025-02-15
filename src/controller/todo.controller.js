import { TodayTodo } from "../model/todaytodo.model.js";
import { Todo } from "../model/todo.model.js";
import cron from "node-cron";
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
    };

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
    await updateTodayTodo();

    return res
      .status(201)
      .json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

const updateTodayTodo = async (req = null, res = null) => {
  try {
    // Fetch the single calendar document
    const calendar = await Todo.findOne();

    if (!calendar) {
      if (res) return res.status(404).json({ error: "No calendar found." });
      console.error("No calendar found.");
      return;
    }

    // Get today's date in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split("T")[0];

    // Filter tasks that are either for today or repeat daily
    const todayTasks = calendar.tasks
      .filter((task) => {
        const taskDateStr = task.date.toISOString().split("T")[0];
        return taskDateStr === todayStr || task.repeat === "daily";
      })
      .map((task) => ({
        taskId: task._id,
        isCompleted: false, // Reset completion status daily
      }));

    // If no tasks for today, clear today's todo list
    if (todayTasks.length === 0) {
      await TodayTodo.deleteMany({});
      if (res)
        return res
          .status(200)
          .json({ message: "No tasks for today, cleared today’s todo list." });
      return;
    }

    // Upsert today's tasks (replace old tasks with new ones)
    await TodayTodo.findOneAndUpdate(
      {},
      { tasks: todayTasks },
      { upsert: true, new: true }
    );

    if (res) {
      return res
        .status(200)
        .json({
          message: "Today's tasks updated successfully",
          tasks: todayTasks,
        });
    }
  } catch (error) {
    console.error("Error updating today's tasks:", error);
    if (res) {
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
};

// Schedule job to run daily at midnight
cron.schedule(
  "0 0 * * *",
  async () => {
    await updateTodayTodo();
  },
  {
    timezone: "Asia/Kolkata", // Set to your preferred timezone (IST for India)
  }
);

const getTodayTasks = async (req, res) => {
  try {
    // Fetch today's todo list
    const todayTodo = await TodayTodo.findOne().lean();

    if (!todayTodo || !todayTodo.tasks.length) {
      return res.status(404).json({ error: "No tasks found for today." });
    }

    // Extract all taskIds as strings for comparison
    const taskIds = todayTodo.tasks.map((task) => task.taskId.toString());


    // Fetch the calendar (assuming there's only one calendar)
    const calendar = await Todo.findOne().lean();

    if (!calendar || !calendar.tasks?.length) {
      return res
        .status(404)
        .json({ error: "No calendar found or no tasks available." });
    }

    // Create a map for quick lookup of isCompleted status
    const taskCompletionMap = new Map(
      todayTodo.tasks.map((t) => [
        t.taskId.toString(),
        { isCompleted: t.isCompleted, _id: t._id },
      ])
    );

    // Filter and map tasks efficiently
    const tasksWithDetails = calendar.tasks
      .filter((task) => taskIds.includes(task._id.toString())) // Ensure ID comparison as string
      .map((task) => ({
        taskId: task._id,
        title: task.title,
        description: task.description,
        isCompleted:
          taskCompletionMap.get(task._id.toString())?.isCompleted || false,
        _id: taskCompletionMap.get(task._id.toString())?._id || null,
      }));


    res.status(200).json({ tasks: tasksWithDetails });
  } catch (error) {
    console.error("Error fetching today's tasks:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId ) {
      return res
        .status(400)
        .json({ error: "Task ID is required." });
    }

    // Find the task inside the Todo collection
    const calendar = await TodayTodo.findOne({ "tasks._id": taskId });

    if (!calendar) {
      return res.status(404).json({ error: "No tasks found." });
    }


    // Find the specific task
    const task = calendar.tasks.find((task) => task._id.toString() === taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Update task status
    task.isCompleted = !task.isCompleted;

  
    await calendar.save();

    res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
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

export {
  createTodo,
  getTodayTasks,
  deleteTodo,
  updateTaskStatus,
  updateTodayTodo,
};
