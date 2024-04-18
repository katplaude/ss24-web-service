import {jest, test, expect, beforeEach, describe} from "@jest/globals"; // this is optional, all three are global variables im runner scope
import app from './app.js';
import request from 'supertest';

describe('avatar api', () => {

    const TEST_DATA = {
        "avatarName": "Mark",
        "childAge": 12,
        "skinColor": "#0000ff",
        "hairstyle": "short",
        "headShape": "oval",
        "upperClothing": "jacket",
        "lowerClothing": "shorts"
    }


    test('create avatar', async () => {
        const createResponse = await request(app)
            .post('/api/avatars')
            .send(TEST_DATA)
            .set('Accept', 'application/json')
            .expect(201);

        expect(createResponse.body).toMatchObject(TEST_DATA);
        expect(createResponse.body.id).toBeGreaterThan(0);
        expect(createResponse.body.createdAt).toBeDefined();

        const getOneResponse = await request(app)
            .get(`/api/avatars/${createResponse.body.id}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(getOneResponse.body).toMatchObject(TEST_DATA);
    });


    test('get all', async () =>{

        const getAllResponse = await request(app)
            .get(`/api/avatars`)
            .set('Accept', 'application/json')
            .expect(200);

        const oldAvatarCount = getAllResponse.body.length;

        const createResponse = await request(app)
            .post('/api/avatars')
            .send(TEST_DATA)
            .set('Accept', 'application/json')
            .expect(201);

        const newAvatarId = createResponse.body.id;

        const getAllNewResponse = await request(app)
            .get(`/api/avatars`)
            .set('Accept', 'application/json')
            .expect(200);

        const newAvatarIncluded = getAllNewResponse.body.some(avatar => avatar.id === newAvatarId);
        expect(newAvatarIncluded).toBe(true);

        const finalAvatarCount = getAllNewResponse.body.length;
        expect(finalAvatarCount).toBe(oldAvatarCount + 1);

    });


    test('delete', async()=>{

        //create a new avatar
        const createResponse = await request(app)
            .post('/api/avatars')
            .send(TEST_DATA)
            .set('Accept', 'application/json')
            .expect(201);

        const newAvatar = createResponse.body.id;

        //avatar count + new one
        const getAllMiddleResponse = await request(app)
            .get(`/api/avatars`)
            .set('Accept', 'application/json')
            .expect(200);

        const middleAvatarCount = getAllMiddleResponse.body.length;

        //delete it
         await request(app)
            .delete(`/api/avatars/${newAvatar}`)
            .set('Accept', 'application/json')
            .expect(204);


        //get the new avatar count
        const getAllNewResponse = await request(app)
            .get(`/api/avatars`)
            .set('Accept', 'application/json')
            .expect(200);
        const newAvatarCount = getAllNewResponse.body.length;


        //expect the new count
        expect(middleAvatarCount).toBe(newAvatarCount+1);

    })


    test('udpate avatar', async()=> {
        const createResponse = await request(app)
            .post('/api/avatars')
            .send(TEST_DATA)
            .set('Accept', 'application/json')
            .expect(201);

        expect(createResponse.body).toMatchObject(TEST_DATA);
        expect(createResponse.body.id).toBeGreaterThan(0);
        expect(createResponse.body.createdAt).toBeDefined();

        const newAvatarId = createResponse.body.id;

        const updatedData = {
            ...TEST_DATA,
            avatarName: "Markuss",
            childAge: 12,
            skinColor: "#0000ff",
            hairstyle: "short",
            headShape: "oval",
            upperClothing: "jacket",
            lowerClothing: "shorts"
        };

        const updateResponse = await request(app)
            .put(`/api/avatars/${newAvatarId}`)
            .send(updatedData)
            .set('Accept', 'application/json')
            .expect(204);

        const getUpdatedResponse = await request(app)
            .get(`/api/avatars/${newAvatarId}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(getUpdatedResponse.body).toMatchObject(updatedData);

    })

});
