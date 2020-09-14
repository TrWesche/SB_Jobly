/** Company class for Job.ly */

const sqlForPartialUpdate = require("../helpers/partialUpdate")
const db = require("../db")

/** Company posting jobs on the site */

class Company {

    static async all(queryParams) {
        if (queryParams) {
            let idx = 1;
            let searchTerms = [];
            let searchValues = [];

            if (queryParams.hasOwnProperty("search")) {
                searchTerms.push(`(handle ILIKE '%$${idx}%' OR name ILIKE '%$${idx}%')`);
                searchValues.push(queryParams.search);
                idx += 1;
            }

            if (queryParams.hasOwnProperty("min_employees")) {
                searchTerm.push(`num_employees > $${idx}`)
                searchValues.push(queryParams.min_employees);
                idx += 1;
            }

            if (queryParams.hasOwnProperty("max_employees")) {
                searchTerm.push(`num_employees < $${idx}`)
                searchValues.push(queryParams.max_employees);
                idx += 1;
            }

            const searchString = searchTerms.join(" AND ");
            const result = await db.query(`
                SELECT handle, name, num_employees, description, logo_url
                FROM companies 
                WHERE ${searchString}`, 
                searchValues);
            return result.rows;

        } else {
            const result = await db.query(`
                SELECT handle, name, num_employees, description, logo_url
                FROM companies`);
            return result.rows;
        }   
    }

    static async new({handle, name, num_employees, description, logo_url}) {
        const result = await db.query(`
            INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees, description, logo_url`,
            [handle, name, num_employees, description, logo_url]);
        return result.rows[0]
    }

    static async get(handle) {
        const result = await db.query(`
            SELECT handle, name, num_employees, description, logo_url
            FROM companies 
            WHERE handle = $1`, 
            [handle]);
        return result.rows[0];
    }

    static async update(handle, updateItems) {
        const { query, values } = sqlForPartialUpdate("companies", updateItems, "handle", handle);
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(handle) {
        const result = await db.query(`
            DELETE FROM companies
            WHERE handle = $1`,
            [handle]);
        // Need to check what result will contain on this
        console.log("Delete Company:", result)
        return result.rows[0];
    }
}

module.exports = Company