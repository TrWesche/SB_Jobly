process.env.NODE_ENV = "test";

const request = require("supertest");
const jwt = require("jsonwebtoken")
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/user");

let testUser = {
    username: "TestMaster",
    password: "password",
    first_name: "Master",
    last_name: "Test",
    email: "masterT@test.com",
    photo_url: "http://testimageplace.com/123xyz",
    is_admin: true
};

let otherUser = {
    username: "LittleTesty",
    password: "password",
    first_name: "Testy",
    last_name: "Little",
    email: "LTesty@test.com",
    photo_url: "http://testimageplace.com/abcd1234",
    is_admin: false
};

let createUser;

beforeEach(async function () {
    await db.query("DELETE FROM users");
    await User.new(testUser);
    await User.new(otherUser);

    createUser = {
        username: "ItsaMeNewUser",
        password: "password",
        first_name: "Mario",
        last_name: "Luigi",
        email: "MarL@test.com",
        photo_url: "http://testimageplace.com/abcd1234",
        is_admin: false
    };
});

afterAll(async function() {
    await db.end();
});


// ╔═══╗╔═══╗╔═══╗╔═══╗╔════╗╔═══╗
// ║╔═╗║║╔═╗║║╔══╝║╔═╗║║╔╗╔╗║║╔══╝
// ║║ ╚╝║╚═╝║║╚══╗║║ ║║╚╝║║╚╝║╚══╗
// ║║ ╔╗║╔╗╔╝║╔══╝║╚═╝║  ║║  ║╔══╝
// ║╚═╝║║║║╚╗║╚══╗║╔═╗║ ╔╝╚╗ ║╚══╗
// ╚═══╝╚╝╚═╝╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝

describe("POST /api/users", () => {

    test("Can Create New User", async () => {
        const res = await request(app).post('/api/users').send(createUser);

        expect(res.statusCode).toBe(200);
        expect(jwt.decode(res.body.token)).toEqual({
            username: createUser.username,
            is_admin: createUser.is_admin,
            iat: expect.any(Number)
        });
    })

    test("Fails Validation on Missing Parameter", async () => {
        // Remove first_name from create object
        delete createUser.first_name;
        
        const res = await request(app).post('/api/users').send(createUser);
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        // Set first_name to a Number
        createUser.first_name = 12345679

        const res = await request(app).post('/api/users').send(createUser);
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on bad email structure", async () => {
        createUser.email = "bademail";

        const res = await request(app).post('/api/users').send(createUser);
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on bad photo_url structure", async () => {
        createUser.photo_url = "thisisnotaurl"

        const res = await request(app).post('/api/users').send(createUser);
        expect(res.statusCode).toBe(400);
    })

});


// ╔═══╗╔═══╗╔═══╗╔═══╗
// ║╔═╗║║╔══╝║╔═╗║╚╗╔╗║
// ║╚═╝║║╚══╗║║ ║║ ║║║║
// ║╔╗╔╝║╔══╝║╚═╝║ ║║║║
// ║║║╚╗║╚══╗║╔═╗║╔╝╚╝║
// ╚╝╚═╝╚═══╝╚╝ ╚╝╚═══╝   

describe("GET /api/users", () => {

    test("Can Get All users", async () => {
        const res = await request(app).get(`/api/users`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({users: [
            {
                username: testUser.username,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                email: testUser.email
            },
            {
                username: otherUser.username,
                first_name: otherUser.first_name,
                last_name: otherUser.last_name,
                email: otherUser.email
            }
        ]});
    })
});


describe("GET /api/users/:username", () => {

    test("Can Get One User By Username", async () => {
        const res = await request(app).get(`/api/users/${testUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({user:
            {
                username: testUser.username,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                email: testUser.email,
                photo_url: testUser.photo_url
            }
        });
    })

});


// ╔╗ ╔╗╔═══╗╔═══╗╔═══╗╔════╗╔═══╗
// ║║ ║║║╔═╗║╚╗╔╗║║╔═╗║║╔╗╔╗║║╔══╝
// ║║ ║║║╚═╝║ ║║║║║║ ║║╚╝║║╚╝║╚══╗
// ║║ ║║║╔══╝ ║║║║║╚═╝║  ║║  ║╔══╝
// ║╚═╝║║║   ╔╝╚╝║║╔═╗║ ╔╝╚╗ ║╚══╗
// ╚═══╝╚╝   ╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝

describe("PATCH /api/users/:username", () => {

    test("Can Update User By Username", async () => {
        testUser.first_name = "MrUpdate";

        const res = await request(app).patch(`/api/users/${testUser.username}`).send(testUser);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({user: 
            {
                username: testUser.username,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                email: testUser.email,
                photo_url: testUser.photo_url
            }
        })
    })

    test("Fails on invalid User Username", async () => {
        const res = await request(app).patch(`/api/users/BADUSERNAME`).send(testUser);
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        testUser.first_name = 123456789

        const res = await request(app).patch(`/api/users/${testUser.username}`).send(testUser);
        expect(res.statusCode).toBe(400);
    });
});


// ╔═══╗╔═══╗╔╗   ╔═══╗╔════╗╔═══╗
// ╚╗╔╗║║╔══╝║║   ║╔══╝║╔╗╔╗║║╔══╝
//  ║║║║║╚══╗║║   ║╚══╗╚╝║║╚╝║╚══╗
//  ║║║║║╔══╝║║ ╔╗║╔══╝  ║║  ║╔══╝
// ╔╝╚╝║║╚══╗║╚═╝║║╚══╗ ╔╝╚╗ ║╚══╗
// ╚═══╝╚═══╝╚═══╝╚═══╝ ╚══╝ ╚═══╝

describe("DELETE /api/users/:username", () => {
    test("Can Delete User By Username", async () => {
        const res = await request(app).delete(`/api/users/${testUser.username}`)
        expect(res.statusCode).toBe(200);
    });

    test("Fails to Delete on Bad Username", async () => {
        const res = await request(app).delete(`/api/users/BADUSERNAME`);
        expect(res.statusCode).toBe(404);
    })
})