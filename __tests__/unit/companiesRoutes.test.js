process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");

const { TEST_DATA, performAfterAll } = require("./jest.config")

let dynamicCompany;
let staticCompany;

let adminUser;
let standardUser;

beforeAll(async function() {
    try {
        await db.query("DELETE FROM users");

        adminUser = await request(app).post('/api/users').send(TEST_DATA.testUserStatic);
        standardUser = await request(app).post('/api/users').send(TEST_DATA.testUserDynamic);
    } catch (error) {
        console.error(error);
    }
})

beforeEach(async function () {
    await db.query("DELETE FROM companies");

    dynamicCompany = await Company.new(TEST_DATA.testCompanyDynamic)
    staticCompany = await Company.new(TEST_DATA.testCompanyStatic);
});

afterAll(async function() {
    await performAfterAll();
});


describe("POST /api/companies", () => {

    test("Can Create New Company", async () => {
        const res = await request(app).post('/api/companies').send({
            token: adminUser.body.token,
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

    test("Fails Create on Missing Token", async () => {
        const res = await request(app).post('/api/companies').send({
            handle: "TEST2",
            name: "TestyCO2",
            num_employees: 500,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        });

        expect(res.statusCode).toBe(401);
    })

    test("Fails Create on Non-Admin Token", async () => {
        const res = await request(app).post('/api/companies').send({
            token: standardUser.body.token,
            handle: "TEST2",
            name: "TestyCO2",
            num_employees: 500,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        });

        expect(res.statusCode).toBe(401);
    })

    test("Fails Validation on Missing Parameter", async () => {
        const res = await request(app).post('/api/companies').send({
            token: adminUser.body.token,
            handle: "TEST2",
            num_employees: 500,
            description: "Makers of software testing stuff",
            logo_url: "https://test.co"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).post('/api/companies').send({
            token: adminUser.body.token,
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
        const res = await request(app).get(`/api/companies`).send({token: adminUser.body.token});
        expect(res.statusCode).toBe(200);;
        expect(res.body).toEqual({companies: [dynamicCompany, staticCompany]});
    });

    test("Fail on Missing Token", async () => {
        const res = await request(app).get(`/api/companies`);
        expect(res.statusCode).toBe(401);;
    });

    test("Ignores Query String: min_employees value Non-Numeric", async () => {
        const res = await request(app).get(`/api/companies?min_employees=xyz`).send({token: adminUser.body.token});
        expect(res.statusCode).toBe(200);;
        expect(res.body).toEqual({companies: [dynamicCompany, staticCompany]});
    });

    test("Fails Validation: min_employees > max_employees value", async () => {
        const res = await request(app).get(`/api/companies?min_employees=500&max_employees=10`).send({token: adminUser.body.token});
        expect(res.statusCode).toBe(400);;
    });

    // Add successful test cases for employee counts
    // Add test for search for company by name
});


describe("GET /api/companies/:handle", () => {

    test("Can Get One Company By Handle", async () => {
        const res = await request(app).get(`/api/companies/${dynamicCompany.handle}`).send({token: adminUser.body.token});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {
            handle: dynamicCompany.handle,
            name: dynamicCompany.name,
            num_employees: dynamicCompany.num_employees,
            description: dynamicCompany.description,
            logo_url: dynamicCompany.logo_url,
            jobs: [null]}
        });
    })

    test("Fail on Missing Token", async () => {
        const res = await request(app).get(`/api/companies/${dynamicCompany.handle}`);
        expect(res.statusCode).toBe(401);
    })

});


describe("PATCH /api/companies/:handle", () => {

    test("Can Update Company By Handle", async () => {
        const res = await request(app).patch(`/api/companies/${dynamicCompany.handle}`).send({
            token: adminUser.body.token,
            handle: dynamicCompany.handle,
            name: "Updated",
            num_employees: dynamicCompany.num_employees,
            description: dynamicCompany.description,
            logo_url: dynamicCompany.logo_url
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {
            handle: dynamicCompany.handle,
            name: "Updated",
            num_employees: dynamicCompany.num_employees,
            description: dynamicCompany.description,
            logo_url: dynamicCompany.logo_url
            }
        })
    })

    test("Fail on Missing Token", async () => {
        const res = await request(app).patch(`/api/companies/${dynamicCompany.handle}`).send({
            handle: dynamicCompany.handle,
            name: "Updated",
            num_employees: dynamicCompany.num_employees,
            description: dynamicCompany.description,
            logo_url: dynamicCompany.logo_url
        });

        expect(res.statusCode).toBe(401);
    })

    test("Fail on Non-Admin Token", async () => {
        const res = await request(app).patch(`/api/companies/${dynamicCompany.handle}`).send({
            token: standardUser.body.token,
            handle: dynamicCompany.handle,
            name: "Updated",
            num_employees: dynamicCompany.num_employees,
            description: dynamicCompany.description,
            logo_url: dynamicCompany.logo_url
        });

        expect(res.statusCode).toBe(401);
    })

    test("Fails on invalid Company Handle", async () => {
        const res = await request(app).patch(`/api/companies/BADHANDLE`).send({
            token: adminUser.body.token,
            handle: "DATA",
            name: "Data",
            num_employees: 10,
            description: "Data",
            logo_url: "http://data.co"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).patch(`/api/companies/${dynamicCompany.handle}`).send({
            token: adminUser.body.token,
            handle: dynamicCompany.handle,
            name: "TestyCO2",
            num_employees: "xyz",
            description: dynamicCompany.description,
            logo_url: dynamicCompany.logo_url
        });
        expect(res.statusCode).toBe(400);
    })
});


describe("DELETE /api/companies/:handle", () => {
    test("Can Delete Company By Handle", async () => {
        const res = await request(app).delete(`/api/companies/${dynamicCompany.handle}`).send({token: adminUser.body.token});
        expect(res.statusCode).toBe(200);
    });

    test("Fail on Missing Token", async () => {
        const res = await request(app).delete(`/api/companies/${dynamicCompany.handle}`);
        expect(res.statusCode).toBe(401);
    });

    test("Fail on Non-Admin Token", async () => {
        const res = await request(app).delete(`/api/companies/${dynamicCompany.handle}`).send({token: standardUser.body.token});
        expect(res.statusCode).toBe(401);
    });

    test("Fails to Delete on Bad Handle", async () => {
        const res = await request(app).delete(`/api/companies/BADHANDLE`).send({token: adminUser.body.token});
        expect(res.statusCode).toBe(404);
    })
})