const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const fileFilter = (req, file, cb)=>{
    const allowedMimeTypes = ["application/vnd.ms-excel"]

    if(allowedMimeTypes.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error('File is not supported'), false);
    }
}

const uploadstor = multer({storage: multer.memoryStorage(), fileFilter: fileFilter})

const app = express()


app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/public", express.static('public'))

app.get('/', (req,res)=>{
    res.render("user_interface")
})

app.post('/generate', ()=>{
    if(false){
        uploadstor.single('file')
    }
}, (req,res,next) => {

    if(!fs.existsSync('uploads')){
        fs.mkdirSync('uploads')
    }

    if(!req.file){
        return res.status(400).json({ message: "file not found"})
    }

    app.use(express.json)
    res.status(200).json({ message: "file uploaded successfully" })
})

app.use((err, req, res, next)=>{
    if (err instanceof multer.MulterError){
        return res.status(400).send({message: "Multer error: " + err.message});
    } 
    if (err) {
        return res.status(400).send({ message: err.message })
    }
    next();
})

app.listen(3000, 'localhost', () => {
    console.log('listening to http://localhost:3000')
})