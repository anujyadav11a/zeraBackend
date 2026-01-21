import mongoose from "mongoose";

const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });



const IssueSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },
  key: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["task", "bug", "story", "epic", "subtask"],
    default: "task"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  priorityOrder: {
    type: Number,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ["todo", "in_progress", "in_review", "done", "closed"],
    default: "todo"
  },
  reporter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  labels: [{
    type: String,
    index: true
  }],
  estimate: {
    type: Number
  },
  dueDate: {
    type: Date
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Issue",
    index: true
  },


  comments: [CommentSchema],
  history: [
    {
      by: { type: Schema.Types.ObjectId, ref: "User" },
      from: Schema.Types.Mixed,
      to: Schema.Types.Mixed,
      at: { type: Date, default: Date.now },
      note: String
    }
  ],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true

  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
}, { timestamps: true });


IssueSchema.pre("validate", function (next) {
  if (this.type === "subtask" && !this.parent) {
    return next(new Error("Subtask must have a parent issue"));
  }

  if (this.type !== "subtask" && this.parent) {
    return next(new Error("Only subtasks can have a parent"));
  }

  next();
});

IssueSchema.index({ project: 1, key: 1 }, { unique: true });

export const Issue = mongoose.model("Issue", IssueSchema);
export const Comment = mongoose.model("Comment", CommentSchema);
