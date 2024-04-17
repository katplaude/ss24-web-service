const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/avatars', async (req, res) =>{
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
    };

    try {
        const data = fs.readFileSync(`${__dirname}/public/avatars.json`);
        const currentAvatars = JSON.parse(data);
        currentAvatars.push(avatar);
        fs.writeFileSync(`${__dirname}/public/avatars.json`, JSON.stringify(currentAvatars, null, 2));

        res.status(201).json(avatar);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/avatars', async (req, res) => {
    try {
        const data = fs.readFileSync(`${__dirname}/public/avatars.json`);
        const currentAvatars = JSON.parse(data);
        const avatars = currentAvatars.map(avatar => `<li>${avatar.characterName}</li>`).join('');
        res.send(`<ul>${avatars}</ul>`);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/avatars/:id', async (req, res) => {
    try {
        const data = fs.readFileSync(`${__dirname}/public/avatars.json`);
        const currentAvatars = JSON.parse(data);
        const avatarDetails = currentAvatars.find(avatar => avatar.id === parseInt(req.params.id));
        if (avatarDetails) {
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
                </table>`;
            res.status(200).send(`<div>${avatarDetailsTable}</div>`);
        } else {
            res.status(404).json({ error: 'Avatar not found' });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/api/avatars', async (req, res) => {
    try {
        const data = fs.readFileSync(`${__dirname}/public/avatars.json`);
        const currentAvatars = JSON.parse(data);
        res.json(currentAvatars);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/api/avatars/:id', async (req, res) => {
    try {
        const avatarId = parseInt(req.params.id);
        const data = fs.readFileSync(`${__dirname}/public/avatars.json`);
        const currentAvatars = JSON.parse(data);
        const avatar = currentAvatars.find(avatar => avatar.id === avatarId);
        if (avatar) {
            res.json(avatar);
        } else {
            res.status(404).json({ error: 'Avatar not found' });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.put('/api/avatars/:id', async (req, res) => {
    try {
        const avatarId = parseInt(req.params.id);
        const updatedAvatarData = req.body;
        const data = fs.readFileSync(`${__dirname}/public/avatars.json`);
        let currentAvatars = JSON.parse(data);
        const avatarIndex = currentAvatars.findIndex(avatar => avatar.id === avatarId);
        if (avatarIndex !== -1) {
            currentAvatars[avatarIndex] = { ...currentAvatars[avatarIndex], ...updatedAvatarData };
            fs.writeFileSync(`${__dirname}/public/avatars.json`, JSON.stringify(currentAvatars, null, 2));
            res.sendStatus(204);
        } else {
            res.status(404).json({ error: 'Avatar not found' });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.delete('/api/avatars/:id', async (req, res) => {
    try {
        const avatarId = parseInt(req.params.id);
        const data = fs.readFileSync(`${__dirname}/public/avatars.json`);
        let currentAvatars = JSON.parse(data);
        const filteredAvatars = currentAvatars.filter(avatar => avatar.id !== avatarId);
        if (currentAvatars.length !== filteredAvatars.length) {
            currentAvatars = filteredAvatars;
            fs.writeFileSync(`${__dirname}/public/avatars.json`, JSON.stringify(currentAvatars, null, 2));
            res.sendStatus(204);
        } else {
            res.status(404).json({ error: 'Avatar not found' });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.listen(3000, () => {
    console.log("Server running...");
});
