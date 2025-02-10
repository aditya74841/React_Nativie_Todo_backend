import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Todo = mongoose.model("Todo", todoSchema);
