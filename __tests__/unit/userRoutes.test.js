process.env.NODE_ENV = "test";

const request = require("supertest");
const jwt = require("jsonwebtoken")
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/user");

const { TEST_DATA, performAfterAll } = require("./jest.config")

let dynamicUser;
let dynamicUserToken;

let staticUser;
let createUser;

beforeEach(async function () {
    await db.query("DELETE FROM users");
    dynamicUser = TEST_DATA.testUserDynamic;
    staticUser = TEST_DATA.testUserStatic;

    dynamicUserToken = await request(app).post('/api/users').send(dynamicUser);
    await User.new(staticUser);

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
    await performAfterAll();
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
                username: staticUser.username,
                first_name: staticUser.first_name,
                last_name: staticUser.last_name,
                email: staticUser.email
            },
            {
                username: dynamicUser.username,
                first_name: dynamicUser.first_name,
                last_name: dynamicUser.last_name,
                email: dynamicUser.email
            }
        ]});
    })
});


describe("GET /api/users/:username", () => {

    test("Can Get One User By Username", async () => {
        const res = await request(app).get(`/api/users/${dynamicUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({user:
            {
                username: dynamicUser.username,
                first_name: dynamicUser.first_name,
                last_name: dynamicUser.last_name,
                email: dynamicUser.email,
                photo_url: dynamicUser.photo_url
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
        dynamicUser.first_name = "MrUpdate";
        dynamicUser.token = dynamicUserToken.body.token;

        const res = await request(app).patch(`/api/users/${dynamicUser.username}`).send(dynamicUser);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({user: 
            {
                username: dynamicUser.username,
                first_name: dynamicUser.first_name,
                last_name: dynamicUser.last_name,
                email: dynamicUser.email,
                photo_url: dynamicUser.photo_url
            }
        })
    })

    test("Fails on missing User Token", async() => {
        dynamicUser.first_name = "MrUpdate";
        const res = await request(app).patch(`/api/users/${dynamicUser.username}`);

        expect(res.statusCode).toBe(401);
    })

    test("Fails on username mismatch", async() => {
        staticUser.token = dynamicUserToken.body.token;
        staticUser.first_name = "SomeonesTampering";
        
        const res = await request(app).patch(`/api/users/${staticUser.username}`).send(staticUser);
        expect(res.statusCode).toBe(401);
    })
});


// ╔═══╗╔═══╗╔╗   ╔═══╗╔════╗╔═══╗
// ╚╗╔╗║║╔══╝║║   ║╔══╝║╔╗╔╗║║╔══╝
//  ║║║║║╚══╗║║   ║╚══╗╚╝║║╚╝║╚══╗
//  ║║║║║╔══╝║║ ╔╗║╔══╝  ║║  ║╔══╝
// ╔╝╚╝║║╚══╗║╚═╝║║╚══╗ ╔╝╚╗ ║╚══╗
// ╚═══╝╚═══╝╚═══╝╚═══╝ ╚══╝ ╚═══╝

describe("DELETE /api/users/:username", () => {
    test("Can Delete User By Username", async () => {
        const res = await request(app).delete(`/api/users/${dynamicUser.username}`).send({token: dynamicUserToken.body.token});
        expect(res.statusCode).toBe(200);
    });

    test("Fails on missing token", async() => {
        const res = await request(app).delete(`/api/users/${dynamicUser.username}`);
        expect(res.statusCode).toBe(401);
    });

    test("Fails on username mismatch", async() => {
        const res = await request(app).delete(`/api/users/${staticUser.username}`).send({token: dynamicUserToken.body.token});
        expect(res.statusCode).toBe(401);
    });
})