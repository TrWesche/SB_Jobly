process.env.NODE_ENV = "test";

const db = require("../../db")
const Company = require("../../models/company")
const Job = require("../../models/job")

let testCompany;

let firstjob;
let otherJob;

describe("Test Job class", () => {
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
        firstjob = await Job.new({
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

    test("Can Create New Job", async () => {
        const testJob = await Job.new({
            title: "NEWJOB",
            salary: 100000,
            equity: 0.0,
            company_handle: testCompany.handle,
            date_posted: "2020-01-01"
        });

        expect(testJob.title).toBe("NEWJOB");
        expect(testJob.company_handle).toBe(testCompany.handle);
    })

    test("Can Get All Jobs", async () => {
        const result = await Job.all();
        expect(result).toEqual([firstjob, otherJob])
    })

    test("Can Search Job By Title", async () => {
        const result1 = await Job.all({search: "fir"})
        const result2 = await Job.all({search: "oth"})
        expect(result1).toEqual([firstjob])
        expect(result2).toEqual([otherJob])
    })

    test("Can Search Company By Salary", async () => {
        const result1 = await Job.all({min_salary: 10000})
        const result2 = await Job.all({min_salary: 75000})
        expect(result1).toEqual([firstjob, otherJob])
        expect(result2).toEqual([firstjob])
    })

    test("Can Search Company By Equity", async () => {
        const result1 = await Job.all({min_equity: 0.00})
        const result2 = await Job.all({min_equity: 0.05})
        expect(result1).toEqual([firstjob, otherJob])
        expect(result2).toEqual([otherJob])
    })

    test("Can Get Job by ID", async () => {
        const result = await Job.get(firstjob.id);
        expect(result).toEqual(firstjob);
    })

    test("Can Get Job by ID with Company", async () => {
        const result = await Job.getComp(firstjob.id);
        expect(result).toEqual({
            id: firstjob.id,
            title: firstjob.title,
            salary: firstjob.salary,
            equity: firstjob.equity,
            date_posted: firstjob.date_posted,
            company: {
                handle: testCompany.handle,
                name: testCompany.name,
                num_employees: testCompany.num_employees,
                description: testCompany.description,
                logo_url: testCompany.logo_url
            }
        });
    })

    test("Can Update Job", async () => {
        const update = {
            id: firstjob.id,
            title: "Updated Title",
            salary: firstjob.salary,
            equity: firstjob.equity,
            company_handle: firstjob.company_handle,
            date_posted: firstjob.date_posted
        }
        const result = await Job.update(firstjob.id, update);
        expect(result.title).toBe("Updated Title");
    })

    test("Can Delete Job", async() => {
        const result = await Job.delete(firstjob.id);
        expect(result.id).toBe(firstjob.id);
    })
})


  