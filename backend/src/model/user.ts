import mongoose from "mongoose";

type UserSchema = {
    name : string,
    keyId : any
}

const userSchema = new mongoose.Schema<UserSchema>({
    name : {
        type : String,
        required : true
    },
    keyId : {
        type : String
    }
});

const User = mongoose.model("User",userSchema);
export default User;