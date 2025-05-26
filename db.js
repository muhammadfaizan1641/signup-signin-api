const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
    name: {type: String, required:true},
    email: {type: String, unique:true, required:true},
    password: {type: String, required:true},
})

const UserModel = mongoose.model("users", User);


module.exports = {
    UserModel
}