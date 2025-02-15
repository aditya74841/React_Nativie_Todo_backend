import mongoose, { Schema } from "mongoose";

const todayTaskSchema = new mongoose.Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Todo" },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const todayCalendarSchema = new mongoose.Schema(
  {
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Calendar belongs to a user

    tasks: [todayTaskSchema], // Tasks associated with this calendar
  },
  { timestamps: true }
);

export const TodayTodo = mongoose.model("TodayTodo", todayCalendarSchema);
