process.env.NODE_ENV = "test";

const db = require("../../db")
const Company = require("../../models/company")

let testCompany;
let otherCompany;

describe("Test Company class", () => {
    beforeEach(async function () {
        await db.query("DELETE FROM companies");
        testCompany = await Company.new({
            handle: "TEST",
            name: "TestyCO",
            num_employees: 1000,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        });

        otherCompany = await Company.new({
            handle: "OTHER",
            name: "OtherCO",
            num_employees: 50,
            description: "Makers of other stuff",
            logo_url: "https://other.co"
        });
    });

    afterAll(async function() {
        await db.end();
    });

    test("Can Create New Company", async () => {
        const testC2 = await Company.new({
            handle: "TEST2",
            name: "TestyCO2",
            num_employees: 500,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        })

        expect(testC2.handle).toBe("TEST2");
        expect(testC2.name).toBe("TestyCO2");
    })

    test("Can Get All Companies", async () => {
        const result = await Company.all();
        expect(result).toEqual([testCompany, otherCompany])
    })

    test("Can Search Company By Name", async () => {
        const result1 = await Company.all({search: "tes"})
        const result2 = await Company.all({search: "oth"})
        expect(result1).toEqual([testCompany])
        expect(result2).toEqual([otherCompany])
    })

    test("Can Search Company By Size", async () => {
        const result1 = await Company.all({min_employees: 500})
        const result2 = await Company.all({max_employees: 500})
        expect(result1).toEqual([testCompany])
        expect(result2).toEqual([otherCompany])
    })

    test("Can Get Company by Handle", async () => {
        const result = await Company.get(testCompany.handle);
        expect(result).toEqual(testCompany);
    })

    test("Can Update Company", async () => {
        const update = {
            handle: testCompany.handle,
            name: "Updated",
            num_employees: testCompany.num_employees,
            description: testCompany.description,
            logo_url: testCompany.logo_url
        }
        const result = await Company.update(testCompany.handle, update);
        expect(result.name).toBe("Updated");
    })

    test("Can Delete Company", async() => {
        const result = await Company.delete(testCompany.handle);
        expect(result.handle).toBe(testCompany.handle);
    })
})


  