process.env.NODE_ENV = "test";

const db = require("../../db")
const User = require("../../models/user")


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

let createUser = {
    username: "ItsaMeNewUser",
    password: "password",
    first_name: "Mario",
    last_name: "Luigi",
    email: "MarL@test.com",
    photo_url: "http://testimageplace.com/abcd1234",
    is_admin: false
};

describe("Test User class", () => {
    beforeEach(async function () {
        await db.query("DELETE FROM users");
        await User.new(testUser);
        await User.new(otherUser);
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

    test("Can Create New User", async () => {
        const createRes = await User.new(createUser);

        // expect(jwt.decode(createRes.token)).toEqual({
        //     username: createUser.username,
        //     is_admin: createUser.is_admin,
        //     iat: expect.any(Number)
        // });

        expect(createRes).toEqual({
            username: createUser.username,
            is_admin: createUser.is_admin
        });
    })


    // ╔═══╗╔═══╗╔═══╗╔═══╗
    // ║╔═╗║║╔══╝║╔═╗║╚╗╔╗║
    // ║╚═╝║║╚══╗║║ ║║ ║║║║
    // ║╔╗╔╝║╔══╝║╚═╝║ ║║║║
    // ║║║╚╗║╚══╗║╔═╗║╔╝╚╝║
    // ╚╝╚═╝╚═══╝╚╝ ╚╝╚═══╝   

    test("Can Get All Users", async () => {
        const result = await User.all();
        expect(result).toEqual([
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
        ]);
    })

    test("Can Get User by Username", async () => {
        const result = await User.get(testUser.username);
        expect(result).toEqual(
            {
                username: testUser.username,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                email: testUser.email,
                photo_url: testUser.photo_url
            }
        );
    })


    // ╔╗ ╔╗╔═══╗╔═══╗╔═══╗╔════╗╔═══╗
    // ║║ ║║║╔═╗║╚╗╔╗║║╔═╗║║╔╗╔╗║║╔══╝
    // ║║ ║║║╚═╝║ ║║║║║║ ║║╚╝║║╚╝║╚══╗
    // ║║ ║║║╔══╝ ║║║║║╚═╝║  ║║  ║╔══╝
    // ║╚═╝║║║   ╔╝╚╝║║╔═╗║ ╔╝╚╗ ║╚══╗
    // ╚═══╝╚╝   ╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝

    test("Can Update User", async () => {
        testUser.first_name = "MrUpdate",
        testUser.password = "password"

        const result = await User.update(testUser.username, testUser);
        expect(result.first_name).toBe("MrUpdate");
    })


    // ╔═══╗╔═══╗╔╗   ╔═══╗╔════╗╔═══╗
    // ╚╗╔╗║║╔══╝║║   ║╔══╝║╔╗╔╗║║╔══╝
    //  ║║║║║╚══╗║║   ║╚══╗╚╝║║╚╝║╚══╗
    //  ║║║║║╔══╝║║ ╔╗║╔══╝  ║║  ║╔══╝
    // ╔╝╚╝║║╚══╗║╚═╝║║╚══╗ ╔╝╚╗ ║╚══╗
    // ╚═══╝╚═══╝╚═══╝╚═══╝ ╚══╝ ╚═══╝
    
    test("Can Delete User", async() => {
        const result = await User.delete(testUser.username);
        expect(result.username).toBe(testUser.username);
    })
})


  