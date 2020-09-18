process.env.NODE_ENV = "test";

const db = require("../../db")
const User = require("../../models/user")

let testUser;
let otherUser;

describe("Test User class", () => {
    beforeEach(async function () {
        await db.query("DELETE FROM users");
        testUser = await User.new({
            username: "TestMaster",
            password: "password",
            first_name: "Master",
            last_name: "Test",
            email: "masterT@test.com",
            photo_url: "http://testimageplace.com/123xyz",
            is_admin: true
        });

        otherUser = await User.new({
            username: "LittleTesty",
            password: "password",
            first_name: "Testy",
            last_name: "Little",
            email: "LTesty@test.com",
            photo_url: "http://testimageplace.com/abcd1234",
            is_admin: false
        });
    });

    afterAll(async function() {
        await db.end();
    });

    test("Can Create New User", async () => {
        const createUser1 = await User.new({
            username: "ItsaMeNewUser",
            password: "password",
            first_name: "Mario",
            last_name: "Luigi",
            email: "MarL@test.com",
            photo_url: "http://testimageplace.com/abcd1234",
            is_admin: false
        });

        expect(createUser1.username).toBe("ItsaMeNewUser");
        expect(createUser1.first_name).toBe("Mario");
        expect(createUser1.password).not.toBe("password");
        expect(createUser1.password).toEqual(expect.any(String));
    })

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

    // Route should be setup to handle & filter changing password
    test("Can Update User", async () => {
        const update = {
            username: testUser.username,
            password: "password",
            first_name: "MrUpdate",
            last_name: testUser.last_name,
            email: testUser.email,
            photo_url: testUser.photo_url,
            is_admin: testUser.is_admin
        }
        const result = await User.update(testUser.username, update);
        expect(result.first_name).toBe("MrUpdate");
    })

    test("Can Delete User", async() => {
        const result = await User.delete(testUser.username);
        expect(result.username).toBe(testUser.username);
    })
})


  