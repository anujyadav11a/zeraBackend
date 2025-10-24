import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },


  role: { type: String, enum: ["admin", "project_head","developer","viewer",], default: "developer" },
   refreshToken: {
        type: String
    },
},

{ timestamps: true }
    
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))return next();
    this.password = await bcrypt.hash(this.password, 10);
    return next();

})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
   return jwt.sign({
       _id:this.id,
       email:this.email,
       role:this.role 
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_LIFE
        
    })
}
userSchema.methods.generateRefreshToken = function () {
   return jwt.sign({
       _id:this.id,
       email:this.email,
       role:this.role 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_LIFE

    })
}

export const User = mongoose.model("User", userSchema)