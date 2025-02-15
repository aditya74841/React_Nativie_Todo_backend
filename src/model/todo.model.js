import mongoose, { Schema } from "mongoose";


const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  date: { type: Date, default: Date.now() }, // Initial date of task
  repeat: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none",
  }, // Determines if task repeats

});

const calendarSchema = new mongoose.Schema(
  {
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Calendar belongs to a user

    tasks: [taskSchema], // Tasks associated with this calendar
  },
  { timestamps: true }
);

export const Todo = mongoose.model("Todo", calendarSchema);
