process.env.NODE_ENV = "test";
process.env.TZ = "UTC"

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const Job = require("../../models/job")

let testCompany;

let firstJob;
let otherJob;

beforeAll(async function() {
    await db.query("DELETE FROM companies");
    testCompany = await Company.new({
        handle: "TESTCO",
        name: "TestyCO",
        num_employees: 1000,
        description: "Makers of software testing stuff",
        logo_url: "https://test.co"
    });
})

beforeEach(async function () {
    await db.query("DELETE FROM jobs");
    firstJob = await Job.new({
        title: "FIRSTJOB",
        salary: 100000,
        equity: 0.0,
        company_handle: testCompany.handle,
        date_posted: "2020-01-01"
    });

    otherJob = await Job.new({
        title: "OTHERJOB",
        salary: 50000,
        equity: 0.1,
        company_handle: testCompany.handle,
        date_posted: "2020-01-01"
    });
});

afterAll(async function() {
    await db.end();
});


describe("POST /api/jobs", () => {

    test("Can Create New Job", async () => {
        //Future: Need to check the date ->  Timezone causing issues for matching
        //const checkDate = new Date("2020-01-01").toJSON()
        const res = await request(app).post('/api/jobs').send({
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

    test("Fails Validation on Missing Required Parameter", async () => {
        const res = await request(app).post('/api/jobs').send({
            title: "NEWJOB",
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).post('/api/jobs').send({
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
        const res = await request(app).get(`/api/jobs`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({jobs: [
            {
                id: firstJob.id,
                title: firstJob.title,
                salary: firstJob.salary,
                equity: firstJob.equity,
                company_handle: firstJob.company_handle,
                date_posted: firstJob.date_posted.toISOString()
            },
            {
                id: otherJob.id,
                title: otherJob.title,
                salary: otherJob.salary,
                equity: otherJob.equity,
                company_handle: otherJob.company_handle,
                date_posted: otherJob.date_posted.toISOString()
            }]
        });
    })

    test("Ignores Query String: min_salary value Non-Numeric", async () => {
        const res = await request(app).get(`/api/jobs?min_salary=xyz`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({jobs: [
            {
                id: firstJob.id,
                title: firstJob.title,
                salary: firstJob.salary,
                equity: firstJob.equity,
                company_handle: firstJob.company_handle,
                date_posted: firstJob.date_posted.toISOString()
            },
            {
                id: otherJob.id,
                title: otherJob.title,
                salary: otherJob.salary,
                equity: otherJob.equity,
                company_handle: otherJob.company_handle,
                date_posted: otherJob.date_posted.toISOString()
            }]
        });
    })

    test("Fails Validation: min_equity > 1.0", async () => {
        const res = await request(app).get(`/api/jobs?min_equity=1.5`);
        expect(res.statusCode).toBe(400);
    })

});


describe("GET /api/jobs/:id", () => {

    test("Can Get One Job By ID", async () => {
        const res = await request(app).get(`/api/jobs/${firstJob.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({job: {
            id: firstJob.id,
            title: firstJob.title,
            salary: firstJob.salary,
            equity: firstJob.equity,
            date_posted: firstJob.date_posted.toISOString(),
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

});


describe("PATCH /api/jobs/:id", () => {

    test("Can Update Job By ID", async () => {
        // new Date().toISOString().split("T")[0]
        console.log(firstJob.date_posted.toISOString().split("T")[0])
        console.log(firstJob)
        const res = await request(app).patch(`/api/jobs/${firstJob.id}`).send({
            id: firstJob.id,
            title: "Updated Title",
            salary: firstJob.salary,
            equity: firstJob.equity,
            company_handle: firstJob.company_handle,
            date_posted: firstJob.date_posted.toISOString().split("T")[0]
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({job: {
            id: firstJob.id,
            title: "Updated Title",
            salary: firstJob.salary,
            equity: firstJob.equity,
            company_handle: firstJob.company_handle,
            date_posted: firstJob.date_posted.toISOString()
            }
        })
    })

    test("Fails on invalid Job ID", async () => {
        const res = await request(app).patch(`/api/jobs/0`).send({
            title: "BADID",
            salary: 100000,
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Fails Validation on Incorrect Parameter Type", async () => {
        const res = await request(app).patch(`/api/jobs/${firstJob.id}`).send({
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
        const res = await request(app).delete(`/api/jobs/${firstJob.id}`)
        expect(res.statusCode).toBe(200);
    });

    test("Fails to Delete on Bad ID", async () => {
        const res = await request(app).delete(`/api/jobs/0`);
        expect(res.statusCode).toBe(404);
    })
})