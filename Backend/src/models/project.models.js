import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Project name is required"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "on-hold", "completed", "archived"],
    default: "active"
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",     
    required: true
  },

  projectHead:{
    type:String,
    required:true
  },
  
  
  memberCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const Project = mongoose.model("Project", projectSchema);
