import mongoose, { Schema } from "mongoose";

// const todoSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     isCompleted: {
//       type: Boolean,
//       default: false,
//     },
//     completedTime: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// export const Todo = mongoose.model("Todo", todoSchema);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  date: { type: Date, default: Date.now() }, // Initial date of task
  repeat: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none",
  }, // Determines if task repeats

  completionHistory: [
    {
      date: { type: Date,  default: Date.now() }, // Specific date task was completed
      completedAt: { type: Date, default: Date.now() }, // Timestamp of completion
    },
  ],

  // status: {
  //   type: String,
  //   enum: ['pending', 'completed'],
  //   default: 'pending'
  // },
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },
});

const calendarSchema = new mongoose.Schema(
  {
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Calendar belongs to a user

    tasks: [taskSchema], // Tasks associated with this calendar
  },
  { timestamps: true }
);

export const Todo = mongoose.model("Todo", calendarSchema);
