import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  issue:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
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

const IssueHistorySchema = new mongoose.Schema(
  {
    Issue:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true
    },
    action: {
      type: String,
      enum: [
        "CREATE",
        "REASSIGN",
        "STATUS_CHANGE",
        "PRIORITY_CHANGE",
        "UPDATE",
        "DELETE"
      ],
      required: true
    },

    field: {
      type: String, // "assignee", "status", "priority","description","title"
      required: true
    },

    from: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    to: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      default: ""
    },

    at: {
      type: Date,
      default: Date.now,
      immutable: true
    }
  },
  { _id: false }
);


const IssueSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    index: true
  },


  comments: {
    type: [CommentSchema],
    default: []
  },
 

  
  isDeleted: {
    type: Boolean,
    default: false,
    index: true

  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  __v: {
    type: Number,
    default: 0
  }
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
export const IssueHistory = mongoose.model("IssueHistory", IssueHistorySchema);
