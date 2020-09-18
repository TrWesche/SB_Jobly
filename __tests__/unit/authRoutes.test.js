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


beforeEach(async function () {
    await db.query("DELETE FROM users");
    await User.new(testUser);
});

afterAll(async function() {
    await db.end();
});


// ╔╗   ╔═══╗╔═══╗╔══╗╔═╗ ╔╗
// ║║   ║╔═╗║║╔═╗║╚╣╠╝║║╚╗║║
// ║║   ║║ ║║║║ ╚╝ ║║ ║╔╗╚╝║
// ║║ ╔╗║║ ║║║║╔═╗ ║║ ║║╚╗║║
// ║╚═╝║║╚═╝║║╚╩═║╔╣╠╗║║ ║║║
// ╚═══╝╚═══╝╚═══╝╚══╝╚╝ ╚═╝
                         
describe("POST /api/login", () => {

    test("Can Login", async () => {
        const res = await request(app).post('/api/login').send({username: testUser.username, password: testUser.password});

        expect(res.statusCode).toBe(200);
        expect(jwt.decode(res.body.token)).toEqual({
            username: testUser.username,
            is_admin: testUser.is_admin,
            iat: expect.any(Number)
        });
    })

    test("Fails Login on Missing  Username/Password", async () => {
        const res = await request(app).post('/api/login').send({password: testUser.password});
        expect(res.statusCode).toBe(400);
    })

    test("Fails Login on Incorrect Username/Password Combination", async () => {
        const res = await request(app).post('/api/login').send({username: testUser.username, password: "wrongpassword"});
        expect(res.statusCode).toBe(400);
    })

});
