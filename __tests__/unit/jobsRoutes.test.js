process.env.NODE_ENV = "test";
// process.env.TZ = "UTC"

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const Job = require("../../models/job");

const { TEST_DATA, performAfterAll } = require("./jest.config")

let testCompany;
let adminUser;
let standardUser;

let dynamicJob;
let staticJob;

beforeAll(async function() {
    try {
        await db.query("DELETE FROM jobs");
        await db.query("DELETE FROM companies");
        await db.query("DELETE FROM users");

        testCompany = await Company.new(TEST_DATA.testCompanyStatic);
        adminUser = await request(app).post('/api/users').send(TEST_DATA.testUserStatic);
        standardUser = await request(app).post('/api/users').send(TEST_DATA.testUserDynamic);

    } catch (error) {
        console.error(error);
    }
    
})

beforeEach(async function() {
    try {
        await db.query("DELETE FROM jobs")

        dynamicJob = await Job.new(TEST_DATA.testJobDynamic);
        staticJob = await Job.new(TEST_DATA.testJobStatic);    

    } catch (error) {
        console.error(error);
    }

});

afterAll(async function() {
    await performAfterAll();
});


describe("POST /api/jobs", () => {

    test("Can Create New Job", async () => {
        //Future: Need to check the date ->  Timezone causing issues for matching
        //const checkDate = new Date("2020-01-01").toJSON()
        const res = await request(app).post('/api/jobs').send({
            token: adminUser.body.token,
            title: "NEWJOB",
            salary: 100000,
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({job: {
            id: expect.any(Number),
            title: "NEWJOB",
            salary: 100000,
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: expect.any(String)
            }
        })
    })

    test("Fails on no User Token", async() => {
        const res = await request(app).post('/api/jobs').send({
            title: "NEWJOB",
            salary: 100000,
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });

        expect(res.statusCode).toBe(401);
    })

    test("Fails on no Non-Admin User Tokken", async() => {
        const res = await request(app).post('/api/jobs').send({
            token: standardUser.body.token,
            title: "NEWJOB",
            salary: 100000,
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });

        expect(res.statusCode).toBe(401);
    })

    test("Fails Validation on Missing Required Parameter", async () => {
        const res = await request(app).post('/api/jobs').send({
            token: adminUser.body.token,
            title: "NEWJOB",
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });
        expect(res.statusCode).toBe(400);
    })
    
    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).post('/api/jobs').send({
            token: adminUser.body.token,
            title: "NEWJOB",
            salary: "100000",
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });
        expect(res.statusCode).toBe(400);
    })
});


describe("GET /api/jobs", () => {

    test("Can Get All Jobs", async () => {
        const res = await request(app).get(`/api/jobs`).send({
            token: adminUser.body.token
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({jobs: [
            {
                id: dynamicJob.id,
                title: dynamicJob.title,
                salary: dynamicJob.salary,
                equity: dynamicJob.equity,
                company_handle: dynamicJob.company_handle,
                date_posted: dynamicJob.date_posted.toISOString()
            },
            {
                id: staticJob.id,
                title: staticJob.title,
                salary: staticJob.salary,
                equity: staticJob.equity,
                company_handle: staticJob.company_handle,
                date_posted: staticJob.date_posted.toISOString()
            }]
        });
    })

    test("Fails on no user token", async() => {
        const res = await request(app).get(`/api/jobs`);
        expect(res.statusCode).toBe(401);
    })

    test("Ignores Query String: min_salary value Non-Numeric", async () => {
        const res = await request(app).get(`/api/jobs?min_salary=xyz`).send({
            token: adminUser.body.token
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({jobs: [
            {
                id: dynamicJob.id,
                title: dynamicJob.title,
                salary: dynamicJob.salary,
                equity: dynamicJob.equity,
                company_handle: dynamicJob.company_handle,
                date_posted: dynamicJob.date_posted.toISOString()
            },
            {
                id: staticJob.id,
                title: staticJob.title,
                salary: staticJob.salary,
                equity: staticJob.equity,
                company_handle: staticJob.company_handle,
                date_posted: staticJob.date_posted.toISOString()
            }]
        });
    })

    test("Fails Validation: min_equity > 1.0", async () => {
        const res = await request(app).get(`/api/jobs?min_equity=1.5`).send({
            token: adminUser.body.token
        });
        expect(res.statusCode).toBe(400);
    })

});


describe("GET /api/jobs/:id", () => {

    test("Can Get One Job By ID", async () => {
        const res = await request(app).get(`/api/jobs/${dynamicJob.id}`).send({
            token: adminUser.body.token
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({job: {
            id: dynamicJob.id,
            title: dynamicJob.title,
            salary: dynamicJob.salary,
            equity: dynamicJob.equity,
            date_posted: dynamicJob.date_posted.toISOString(),
            company: {
                handle: testCompany.handle,
                name: testCompany.name,
                num_employees: testCompany.num_employees,
                description: testCompany.description,
                logo_url: testCompany.logo_url
            }
        }
        });
    })

    test("Fails on no user token", async() => {
        const res = await request(app).get(`/api/jobs/${dynamicJob.id}`);
        expect(res.statusCode).toBe(401);
    })

});


describe("PATCH /api/jobs/:id", () => {

    test("Can Update Job By ID", async () => {
        const res = await request(app).patch(`/api/jobs/${dynamicJob.id}`).send({
            token: adminUser.body.token,
            id: dynamicJob.id,
            title: "Updated Title",
            salary: dynamicJob.salary,
            equity: dynamicJob.equity,
            company_handle: dynamicJob.company_handle,
            date_posted: dynamicJob.date_posted.toISOString().split("T")[0]
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({job: {
            id: dynamicJob.id,
            title: "Updated Title",
            salary: dynamicJob.salary,
            equity: dynamicJob.equity,
            company_handle: dynamicJob.company_handle,
            date_posted: dynamicJob.date_posted.toISOString()
            }
        })
    })

    test("Fails on no user token", async() => {
        const res = await request(app).patch(`/api/jobs/${dynamicJob.id}`).send({
            id: dynamicJob.id,
            title: "Updated Title",
            salary: dynamicJob.salary,
            equity: dynamicJob.equity,
            company_handle: dynamicJob.company_handle,
            date_posted: dynamicJob.date_posted.toISOString().split("T")[0]
        });
        expect(res.statusCode).toBe(401);
    })

    test("Fails on Non-Admin user token", async() => {
        const res = await request(app).patch(`/api/jobs/${dynamicJob.id}`).send({
            token: standardUser.body.token,
            id: dynamicJob.id,
            title: "Updated Title",
            salary: dynamicJob.salary,
            equity: dynamicJob.equity,
            company_handle: dynamicJob.company_handle,
            date_posted: dynamicJob.date_posted.toISOString().split("T")[0]
        });
        expect(res.statusCode).toBe(401);
    })

    test("Fails on invalid Job ID", async () => {
        const res = await request(app).patch(`/api/jobs/0`).send({
            token: adminUser.body.token,
            title: "BADID",
            salary: 100000,
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).patch(`/api/jobs/${dynamicJob.id}`).send({
            token: adminUser.body.token,
            title: "BADSALARY",
            salary: "100000",
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });
        expect(res.statusCode).toBe(400);
    })
});

describe("DELETE /api/jobs/:id", () => {
    test("Can Delete Job By ID", async () => {
        const res = await request(app).delete(`/api/jobs/${dynamicJob.id}`).send({
            token: adminUser.body.token
        });
        expect(res.statusCode).toBe(200);
    });

    test("Fails on no user token", async () => {
        const res = await request(app).delete(`/api/jobs/${dynamicJob.id}`);
        expect(res.statusCode).toBe(401);
    });

    test("Fails on Non-Admin user token", async () => {
        const res = await request(app).delete(`/api/jobs/${dynamicJob.id}`).send({
            token: standardUser.body.token
        });
        expect(res.statusCode).toBe(401);
    });


    test("Fails to Delete on Bad ID", async () => {
        const res = await request(app).delete(`/api/jobs/0`).send({
            token: adminUser.body.token
        });
        expect(res.statusCode).toBe(404);
    })
})