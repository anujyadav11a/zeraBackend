import mongoose, {Schema} from 'mongoose';
import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  farmLocation: { type: String, required: false },
  soilType: { type: String, required: false },
  crop: { type: String, required: false },
  role: { type: String, enum: ["farmer", "admin"], default: "farmer" },
}, { timestamps: true }
    
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))return next();
    this.password = await bycrypt.hash(this.password, 10);
    return next();

})

userSchema.methods.comparePassword = async function (password) {
    return await bycrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    jwt.sign({
       _id:this.id,
       email:this.email,
       role:this.role 
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_LIFE
        
    })
}
userSchema.methods.generateRefreshToken = function () {
    jwt.sign({
       _id:this.id,
       email:this.email,
       role:this.role 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_LIFE

    })
}

export const User = mongoose.model("User", userSchema);