/** Job class for Job.ly */

const sqlForPartialUpdate = require("../helpers/partialUpdate")
const db = require("../db")

/** Company posting jobs on the site */

class Job {

    static async all(queryParams) {
        if (queryParams) {
            let idx = 1;
            let searchTerms = [];
            let searchValues = [];

            if (queryParams.hasOwnProperty("search")) {
                searchTerms.push(`(title ILIKE $${idx} OR company_handle ILIKE $${idx})`);
                searchValues.push('%'+queryParams.search+'%');
                idx += 1;
            }

            if (queryParams.hasOwnProperty("min_salary")) {
                searchTerms.push(`salary >= $${idx}`)
                searchValues.push(queryParams.min_salary);
                idx += 1;
            }

            if (queryParams.hasOwnProperty("min_equity")) {
                searchTerms.push(`equity >= $${idx}`)
                searchValues.push(queryParams.min_equity);
                idx += 1;
            }

            const searchString = searchTerms.join(" AND ");
            const result = await db.query(`
                SELECT id, title, salary, equity, company_handle, date_posted
                FROM jobs 
                WHERE ${searchString}
                ORDER BY date_posted DESC`, 
                searchValues);
            return result.rows;

        } else {
            const result = await db.query(`
                SELECT id, title, salary, equity, company_handle, date_posted
                FROM jobs
                ORDER BY date_posted DESC`);
            return result.rows;
        }   
    }

    static async new(jobParams) {
        const date_posted = (jobParams.date_posted) ? jobParams.date_posted : new Date().toDateString();
        const result = await db.query(`
            INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, title, salary, equity, company_handle, date_posted`,
            [jobParams.title, jobParams.salary, jobParams.equity, jobParams.company_handle, date_posted]);
        return result.rows[0]
    }

    static async get(id) {
        const result = await db.query(`
            SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs
            WHERE id = $1`, 
            [id]);
        return result.rows[0];
    }

    static async getComp(id) {
        const result = await db.query(`
            SELECT id, title, salary, equity, date_posted, to_json(companies) AS company
            FROM jobs
            FULL OUTER JOIN companies
            ON jobs.company_handle = companies.handle
            WHERE id = $1`, 
            [id]);
        return result.rows[0];
    }

    static async update(id, updateItems) {
        const { query, values } = sqlForPartialUpdate("jobs", updateItems, "id", id);
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await db.query(`
            DELETE FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]);
        return result.rows[0];
    }
}

module.exports = Job