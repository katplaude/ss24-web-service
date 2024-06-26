const  express = require('express')
const path = require('path');
const  {fileURLToPath}  =require('url');
const fs = require("fs");

const {v4: uuid} = require('uuid');
const avatarSchema = require("./routers/avatars/avatar.schema.js");
const passport = require("passport");
const {BasicStrategy}= require("passport-http");
const bcrypt = require("bcrypt");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const{isParent, isChild} = require('roles.js');

const module_dir = import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : __dirname;

// create the data file in current working directory (cwd) if it does not yet exist
const data_file = path.join(process.cwd(), 'avatars.json');
if (!fs.existsSync(data_file)) {
    fs.writeFileSync(data_file, JSON.stringify([]))
}

const user_file = path.join(process.cwd(), 'users.json');
if (!fs.existsSync(user_file)) {
    fs.writeFileSync(user_file, JSON.stringify([]))
}


const app = express()

passport.use(new BasicStrategy(
    async function(userid, password, done) {
        try {
            const users = JSON.parse(fs.readFileSync(user_file, 'utf8'))
            const user = users.find(user => user.userName === userid);
            if (user) {
                const isCorrect = await bcrypt.compare(password, user.password);
                if(isCorrect) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            } else {
                done(null, false);
            }
        } catch (err) {
            done(err);
        }
    }
));


app.use(express.static(path.join(module_dir, 'public')))
app.use(express.json())
app.use(passport.authenticate('basic', {session: false}));

app.get('/', function (req, res) {
    res.sendFile(`index.html`)
})

app.post('/api/avatars',
    isParent,
    (req, res) => {
        console.log(" POST /api/avatars")

        const {error, value} = avatarSchema.validate(req.body);

        if (error) {
            res.status(400).send(error)
            return
        }

        const newAvatar = {
            id: uuid(),
            ...value,
            createdAt: new Date(Date.now()).toISOString()
        }

        try {
            const obj = JSON.parse(fs.readFileSync(data_file, "utf8"))

            fs.writeFileSync(data_file, JSON.stringify([...obj, newAvatar]))
            res.status(201).set("Location", `/api/avatars/${newAvatar.id}`).send(newAvatar)
        } catch (e) {
            res.sendStatus(500)
        }
    })

app.get(
    "/api/avatars",
    isChild,
    (req, res) => {
        console.log(" GET /api/avatars")
        const avatarsArray = JSON.parse(fs.readFileSync(data_file, "utf8"))
        res.send(avatarsArray)
    })

app.get("/api/avatars/:id",
    isChild,
    (req, res) => {
        const avatarID = req.params.id;
        console.log(` GET /api/avatars/:${avatarID}`)
        const avatarsArray = JSON.parse(fs.readFileSync(data_file, "utf8"))
        const avatar = avatarsArray.find((av) => av.id === avatarID)
        if (!avatar)
            res.sendStatus(404)
        else
            res.send(avatar)
    })

app.put("/api/avatars/:id",
    isParent,
    async (req, res) => {
        try {
            const {error, value} = avatarSchema.validate(req.body, {abortEarly: false});

            if (error) {
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

app.delete("/api/avatars/:id",
    isParent,
    (req, res) => {
        const avatarID = parseInt(req.params.id)
        console.log(` DELETE /api/avatars/:${avatarID}`)
        const avatarsArray = JSON.parse(fs.readFileSync(data_file, "utf8"))
        const avatar = avatarsArray.findIndex((av) => av.id === avatarID)
        if (avatar === -1)
            res.sendStatus(404)
        else {
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