process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");

let testCompany;
let otherCompany;

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


describe("POST /api/companies", () => {

    test("Can Create New Company", async () => {
        const res = await request(app).post('/api/companies').send({
            handle: "TEST2",
            name: "TestyCO2",
            num_employees: 500,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {
            handle: "TEST2",
            name: "TestyCO2",
            num_employees: 500,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
            }
        })
    })

    test("Fails Validation on Missing Parameter", async () => {
        const res = await request(app).post('/api/companies').send({
            handle: "TEST2",
            num_employees: 500,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).post('/api/companies').send({
            handle: "TEST2",
            name: "TestyCO2",
            num_employees: "500",
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        });
        expect(res.statusCode).toBe(400);
    })
});


describe("GET /api/companies", () => {

    test("Can Get All Companies", async () => {
        const res = await request(app).get(`/api/companies`);
        expect(res.statusCode).toBe(200);;
        expect(res.body).toEqual({companies: [testCompany, otherCompany]});
    })

    test("Ignores Query String: min_employees value Non-Numeric", async () => {
        const res = await request(app).get(`/api/companies?min_employees=xyz`);
        expect(res.statusCode).toBe(200);;
        expect(res.body).toEqual({companies: [testCompany, otherCompany]});
    })

    test("Fails Validation: min_employees > max_employees value", async () => {
        const res = await request(app).get(`/api/companies?min_employees=500&max_employees=10`);
        expect(res.statusCode).toBe(400);;
    })

});


describe("GET /api/companies/:handle", () => {

    test("Can Get One Company By Handle", async () => {
        const res = await request(app).get(`/api/companies/${testCompany.handle}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {
            handle: testCompany.handle,
            name: testCompany.name,
            num_employees: testCompany.num_employees,
            description: testCompany.description,
            logo_url: testCompany.logo_url,
            jobs: [null]}
        });
    })

});


describe("PATCH /api/companies/:handle", () => {

    test("Can Update Company By Handle", async () => {
        const res = await request(app).patch(`/api/companies/${testCompany.handle}`).send({
            handle: testCompany.handle,
            name: "Updated",
            num_employees: testCompany.num_employees,
            description: testCompany.description,
            logo_url: testCompany.logo_url
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {
            handle: testCompany.handle,
            name: "Updated",
            num_employees: testCompany.num_employees,
            description: testCompany.description,
            logo_url: testCompany.logo_url
            }
        })
    })

    test("Fails on invalid Company Handle", async () => {
        const res = await request(app).patch(`/api/companies/BADHANDLE`).send({
            handle: "DATA",
            name: "Data",
            num_employees: 10,
            description: "Data",
            logo_url: "http://data.co"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).patch(`/api/companies/${testCompany.handle}`).send({
            handle: testCompany.handle,
            name: "TestyCO2",
            num_employees: "xyz",
            description: testCompany.description,
            logo_url: testCompany.logo_url
        });
        expect(res.statusCode).toBe(400);
    })
});


describe("DELETE /api/companies/:handle", () => {
    test("Can Delete Company By Handle", async () => {
        const res = await request(app).delete(`/api/companies/${testCompany.handle}`)
        expect(res.statusCode).toBe(200);
    });

    test("Fails to Delete on Bad Handle", async () => {
        const res = await request(app).delete(`/api/companies/BADHANDLE`);
        expect(res.statusCode).toBe(404);
    })
})