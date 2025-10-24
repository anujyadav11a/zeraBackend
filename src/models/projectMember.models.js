import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    enum: ["ProjectLeader", "member"],
    default: "member"
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);
