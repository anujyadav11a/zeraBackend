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
      enum: ["task","bug","story","epic","subtask"], 
      default: "task" 
    },
  priority: { 
    type: String, 
    enum: ["low","medium","high","urgent"], 
    default: "medium"
 },
  status: {
     type: String,
      enum: ["todo","in_progress","in_review","done","closed"], 
      default: "todo"
     },
  reporter: { 
    type: Schema.Types.ObjectId,
     ref: "User", 
     required: true 
    },
  assignee: {
     type: Schema.Types.ObjectId, 
     ref: "User" 
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
    ref: "Issue" 
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
    default: false 
} 
}, { timestamps: true });

IssueSchema.index({ project: 1, key: 1 }, { unique: true });

export const Issue = mongoose.model("Issue", IssueSchema);
export const Comment = mongoose.model("Comment", CommentSchema);
