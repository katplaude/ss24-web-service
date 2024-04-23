const app = require('./app.js');
const request = require('supertest');
const {expect, describe, test} = require("@jest/globals");

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
        console.log(createResponse.body)
        expect(createResponse.body).toMatchObject(TEST_DATA);
        // expect(createResponse.body.id).toBeGreaterThan(0);
        expect(createResponse.body.createdAt).toBeDefined();

        const newAvatarId = createResponse.body.id;

        const getOneResponse = await request(app)
            .get(`/api/avatars/${newAvatarId}`)
            .set('Accept', 'application/json')
            // .expect(200);

        expect(getOneResponse.body).toMatchObject(TEST_DATA);
    });

    test('get all', async () => {

        const getAllResponse = await request(app)
            .get(`/api/avatars`)
            .set('Accept', 'application/json')
            .expect(200);

        const createResponse = await request(app)
            .post('/api/avatars')
            .send(TEST_DATA)
            .set('Accept', 'application/json')
            .expect(201);

        const newAvatarId = createResponse.body.id;

        const getAllWithNewResponse = await request(app)
            .get(`/api/avatars`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(getAllResponse.body.length + 1).toEqual(getAllWithNewResponse.body.length)
        expect(getAllWithNewResponse.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: newAvatarId
                })
            ])
        );
    });

    test('create avatar requires at least avatar name and childs age', async () => {

        const testData = {
            "skinColor": "#0000ff",
            "hairstyle": "short",
            "headShape": "oval",
            "upperClothing": "jacket",
            "lowerClothing": "shorts"
        }

        const createResponse = await request(app)
            .post('/api/avatars')
            .send(testData)
            .set('Accept', 'application/json')
            .expect(400);
    });

    test('create avatar requires upperClothing to be dress', async () => {

        const testData = {
           avatarName: "Lara",
            childAge: 6,
            skinColor: "#0000ff",
            hairstyle: "long",
            headShape: "heart",
            upperClothing: "dress",
        }

        const createResponse = await request(app)
            .post('/api/avatars')
            .send(testData)
            .set('Accept', 'application/json')
            .expect(400);

        expect(createResponse.status).toBe(400);
    });

});

