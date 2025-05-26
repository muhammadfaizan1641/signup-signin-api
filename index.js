const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {UserModel} = require("./db");
const {z} = require("zod");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
mongoose.connect(MONGODB_URL);
app.use(express.json());


app.get("/",(req,res)=>{
    res.send({
        message:"API is working"
    })
})

app.post("/signup" , async function(req,res){
    const requiredBody = z.object({
        email: z.string().max(100).email(),
        name: z.string().min(3).max(30),
        password: z.string().min(5).max(13)
    })

    const parsedDataWithSuccess = requiredBody.safeParse(req.body);

    if(!parsedDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parsedDataWithSuccess.error.errors
        })

    }

    const {email, password, name} = req.body; 

    try {
        const hashedPassword = await bcrypt.hash(password,5);
        console.log(hashedPassword);

        await UserModel.create({
            email: email,
            password: hashedPassword,
            name: name
    });
    res.json({
        message: "You are logged in"
    })
    } catch (e) {
        if (e.code === 11000) { // Duplicate key error
            res.status(400).json({
                message: "Email already exists"
            });
        } else {
            console.error(e);
            res.status(500).json({
                message: "Something went wrong"
            });
        }
    }

});

app.post("/signin" , async function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
    });

    if(!response){
        res.status(403).json({
            message: "User does not exist in our db "
        })
        return
    }

    const passwordMatch = await bcrypt.compare(password,response.password);


    if(passwordMatch){
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET)
        res.json({
        message: "Login successful",
        token: token
    });
    }else{
        res.status(403).json({
            message: "Invalid credientials"
        })
    }
 

});

app.use((req,res)=>{
    res.status(404).send({
        message: "No such endpoint"
    })
})


app.listen(PORT, () => {
  console.log("Server started on port 3000");
});



