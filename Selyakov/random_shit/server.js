let express = require("express")
let cors = require("cors") 
let app = express()
app.use(cors())
app.get("/ser", (req, res) =>{
    res.send(Number(req.query.x) + Number(req.query.z))
})
app.listen(3000, () => {
    console.log("let's go")
})