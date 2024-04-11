const mongoose = require("mongoose");

const DB = "mongodb+srv://Titan:Titan2406@cluster0.prjlqny.mongodb.net/Authusers?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log("Database Connected")).catch((errr) =>{
    console.log(errr);
})