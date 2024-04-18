const  express = require("express")
const path = require('path');
const  {fileURLToPath}  =require('url');
const fs = require("fs");
const {response} = require("express");
const {v4: uuid} = require('uuid');
const avatarSchema = require("./avatar.schema.js");

// create the data file if it does not yet exist
const data_file = path.join(process.cwd(),'avatars.json');
if (!fs.existsSync(data_file)) {
    fs.writeFileSync(data_file, JSON.stringify([]))
}

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.get('/', function (req, res) {
    res.sendFile(`index.html`)
})

app.post('/api/avatars', (req, res)=>{
    console.log(" POST /api/avatars")

    const {error, value} = avatarSchema.validate(req.body);

    if(error){
        res.status(400).send(error)
        return
    }

    const newAvatar = {
        id: uuid(),
        ...value,
        createdAt: new Date(Date.now()).toISOString()
    }

    try {
        const obj =  JSON.parse(fs.readFileSync(data_file, "utf8"))

        fs.writeFileSync(data_file, JSON.stringify([...obj, newAvatar]))
        res.status(201).set("Location", `/api/avatars/${newAvatar.id}`).send(newAvatar)
    }catch (e){
        res.sendStatus(500)
    }
})

app.get("/api/avatars", (req, res)=>{
    console.log(" GET /api/avatars")
    const avatarsArray =  JSON.parse(fs.readFileSync(data_file, "utf8"))
    res.send(avatarsArray)
})

app.get("/api/avatars/:id", (req, res)=>{
    const avatarID = (req.params.id)
    console.log(` GET /api/avatars/:${avatarID}`)
    const avatarsArray =  JSON.parse(fs.readFileSync(data_file, "utf8"))
    const avatar = avatarsArray.find((av)=>av.id===avatarID)
    if(!avatar)
        res.sendStatus(404)
    else
        res.send(avatar)
})

app.put("/api/avatars/:id", async (req, res)=>{
    try {

        const {error, value} = avatarSchema.validate(req.body, {abortEarly: false});

        if(error){
            res.status(400).send(error)
            return
        }

        const data = fs.readFileSync(data_file);
        const avatars = JSON.parse(data);

        const avatar = avatars.find(avatar => avatar.id === parseInt(req.params.id));

        if (!avatar) {
            res.sendStatus(404)
            return;
        }

        avatar.avatarName = req.body.avatarName;
        avatar.childAge = req.body.childAge;
        avatar.skinColor = req.body.skinColor;
        avatar.hairstyle = req.body.hairstyle;
        avatar.headShape = req.body.headShape;
        avatar.upperClothing = req.body.upperClothing;
        avatar.lowerClothing = req.body.lowerClothing;

        fs.writeFileSync(data_file, JSON.stringify(avatars))

        res.sendStatus(204);
    } catch {
        res.sendStatus(500)
    }
})

app.delete("/api/avatars/:id", (req, res)=>{
    const avatarID = parseInt(req.params.id)
    console.log(` DELETE /api/avatars/:${avatarID}`)
    const avatarsArray =  JSON.parse(fs.readFileSync(data_file, "utf8"))
    const avatar = avatarsArray.findIndex((av)=>av.id===avatarID)
    if(avatar===-1)
        res.sendStatus(404)
    else{
        avatarsArray.splice(avatar, 1)
        fs.writeFileSync(data_file, JSON.stringify(avatarsArray), (err) => {
            if (err) {
                console.log("ERROR")
            }
        })
        res.sendStatus(204)
    }

})

module.exports = app;