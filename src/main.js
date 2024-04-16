const express = require('express')
const app = express()
const path = require('path');
const fs = require('fs');
app.use(express.urlencoded({extended:true}));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
app.post('/create-avatar', async (req, res) =>{
    console.log(req.body);
    const avatar = {
        id: Date.now(),
        characterName: req.body.avatarName,
        childAge: parseInt(req.body.age),
        skinColor: req.body.skinColor,
        hairstyle: req.body.hairstyle,
        headShape: req.body.headShape,
        upperClothing: req.body.upperClothing,
        lowerClothing: req.body.lowerClothing,
        createdAt: new Date().toISOString()
    }
    try {
        const data = await fs.readFileSync(`${__dirname}/public/avatars.json`);
        const currentAvatars = JSON.parse(data)
        currentAvatars.push(avatar)
        await fs.writeFileSync(`${__dirname}/public/avatars.json`, JSON.stringify(currentAvatars, null, 2))
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
    }
});
app.get('/avatars',async (req, res) => {
    try {
        // Reads the avatars file
        const data = await fs.readFileSync(`avatars.json`);
        // parses the json
        const currentAvatars = JSON.parse(data);
        // create a new array and return it as html list items
        const avatars = currentAvatars.map(avatar => `<li>${avatar.characterName}</li>`).join('');
        //sends a response to the server
        res.send(`<ul>${avatars}</ul>`);
    } catch (error) {
        res.sendStatus(500)
    }
})
app.get('/avatars/:id',async (req, res) => {
    try {
        // Reads the avatars file
        const data = await fs.readFileSync(`avatars.json`);
        // parses the json
        const currentAvatars = JSON.parse(data);

        // finds the requested user
        const avatarDetails = currentAvatars.find(avatar => avatar.id === parseInt(req.params.id));
        const avatarDetailsTable = `
                <table>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Skin Color</th>
                    <th>Hair Style</th>
                    <th>Head Shape</th>
                    <th>Upper Clothing</th>
                    <th>Lower Clothing</th>
                </tr>
                <tr>
                    <td>${avatarDetails.characterName}</td>
                    <td>${avatarDetails.childAge}</td>
                    <td>${avatarDetails.skinColor}</td>
                    <td>${avatarDetails.hairstyle}</td>
                    <td>${avatarDetails.headShape}</td>
                    <td>${avatarDetails.upperClothing}</td>
                    <td>${avatarDetails.lowerClothing}</td>
                </tr>
            </table>
            `
        res.status(200).send(`<div>${avatarDetailsTable}</div>`);
    } catch (error) {
        res.sendStatus(500)
    }
})
app.listen(3000, () => {
    console.log("Server running...")
})