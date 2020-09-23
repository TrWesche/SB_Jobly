/** User class for Job.ly */

const sqlForPartialUpdate = require("../helpers/partialUpdate")
const db = require("../db")

const bcrypt = require("bcrypt")
const { BCRYPT_WORK_FACTOR } = require("../config");


class User {

    // ╔═══╗╔═══╗╔═══╗╔═══╗╔════╗╔═══╗
    // ║╔═╗║║╔═╗║║╔══╝║╔═╗║║╔╗╔╗║║╔══╝
    // ║║ ╚╝║╚═╝║║╚══╗║║ ║║╚╝║║╚╝║╚══╗
    // ║║ ╔╗║╔╗╔╝║╔══╝║╚═╝║  ║║  ║╔══╝
    // ║╚═╝║║║║╚╗║╚══╗║╔═╗║ ╔╝╚╗ ║╚══╗
    // ╚═══╝╚╝╚═╝╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝
              
    static async new(bodyParams) {
        const hashedPassword = await bcrypt.hash(bodyParams.password, BCRYPT_WORK_FACTOR);
        const is_admin = bodyParams.is_admin ? bodyParams.is_admin : false;
        const result = await db.query(`
            INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, is_admin`,
            // RETURNING username, password, first_name, last_name, email, photo_url, is_admin,
            [bodyParams.username, hashedPassword, bodyParams.first_name, bodyParams.last_name, bodyParams.email, bodyParams.photo_url, is_admin]);
        return result.rows[0]
    }

    // ╔═══╗╔═══╗╔═══╗╔═══╗
    // ║╔═╗║║╔══╝║╔═╗║╚╗╔╗║
    // ║╚═╝║║╚══╗║║ ║║ ║║║║
    // ║╔╗╔╝║╔══╝║╚═╝║ ║║║║
    // ║║║╚╗║╚══╗║╔═╗║╔╝╚╝║
    // ╚╝╚═╝╚═══╝╚╝ ╚╝╚═══╝   

    static async all() {
        const result = await db.query(`
            SELECT username, first_name, last_name, email
            FROM users
            ORDER BY username DESC`);
        return result.rows;
    }

    static async get(username) {
        const result = await db.query(`
            SELECT username, first_name, last_name, email, photo_url
            FROM users
            WHERE username = $1`, 
            [username]);
        return result.rows[0];
    }


    // ╔╗ ╔╗╔═══╗╔═══╗╔═══╗╔════╗╔═══╗
    // ║║ ║║║╔═╗║╚╗╔╗║║╔═╗║║╔╗╔╗║║╔══╝
    // ║║ ║║║╚═╝║ ║║║║║║ ║║╚╝║║╚╝║╚══╗
    // ║║ ║║║╔══╝ ║║║║║╚═╝║  ║║  ║╔══╝
    // ║╚═╝║║║   ╔╝╚╝║║╔═╗║ ╔╝╚╗ ║╚══╗
    // ╚═══╝╚╝   ╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝

    static async update(username, updateItems) {
        let processedItems = {};
        for (let item in updateItems) {
            if (item === "password") {
                processedItems[item] = await bcrypt.hash(updateItems.password, BCRYPT_WORK_FACTOR);
            } else {
                processedItems[item] = updateItems[item];
            }
        }

        const { query, values } = sqlForPartialUpdate("users", processedItems, "username", username);
        const result = await db.query(query, values);
        const returnObj = {
            username: result.rows[0].username,
            first_name: result.rows[0].first_name,
            last_name: result.rows[0].last_name,
            email: result.rows[0].email,
            photo_url: result.rows[0].photo_url
        }
        return returnObj;
    }


    // ╔═══╗╔═══╗╔╗   ╔═══╗╔════╗╔═══╗
    // ╚╗╔╗║║╔══╝║║   ║╔══╝║╔╗╔╗║║╔══╝
    //  ║║║║║╚══╗║║   ║╚══╗╚╝║║╚╝║╚══╗
    //  ║║║║║╔══╝║║ ╔╗║╔══╝  ║║  ║╔══╝
    // ╔╝╚╝║║╚══╗║╚═╝║║╚══╗ ╔╝╚╗ ║╚══╗
    // ╚═══╝╚═══╝╚═══╝╚═══╝ ╚══╝ ╚═══╝

    static async delete(username) {
        const result = await db.query(`
            DELETE FROM users
            WHERE username = $1
            RETURNING username`,
            [username]);
        return result.rows[0];
    }


    // ╔═══╗╔╗ ╔╗╔════╗╔╗ ╔╗╔═══╗╔═╗ ╔╗╔════╗╔══╗╔═══╗╔═══╗╔════╗╔═══╗
    // ║╔═╗║║║ ║║║╔╗╔╗║║║ ║║║╔══╝║║╚╗║║║╔╗╔╗║╚╣╠╝║╔═╗║║╔═╗║║╔╗╔╗║║╔══╝
    // ║║ ║║║║ ║║╚╝║║╚╝║╚═╝║║╚══╗║╔╗╚╝║╚╝║║╚╝ ║║ ║║ ╚╝║║ ║║╚╝║║╚╝║╚══╗
    // ║╚═╝║║║ ║║  ║║  ║╔═╗║║╔══╝║║╚╗║║  ║║   ║║ ║║ ╔╗║╚═╝║  ║║  ║╔══╝
    // ║╔═╗║║╚═╝║ ╔╝╚╗ ║║ ║║║╚══╗║║ ║║║ ╔╝╚╗ ╔╣╠╗║╚═╝║║╔═╗║ ╔╝╚╗ ║╚══╗
    // ╚╝ ╚╝╚═══╝ ╚══╝ ╚╝ ╚╝╚═══╝╚╝ ╚═╝ ╚══╝ ╚══╝╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝
                                                                   
    static async authenticate(bodyParams) {
        const result = await db.query(`
            SELECT username, password, is_admin
            FROM users
            WHERE username = $1`,
            [bodyParams.username]);

        if (result.rows[0]) {
            const dbPassword = result.rows[0].password;
            const valid = await bcrypt.compare(bodyParams.password, dbPassword)
    
            if (valid) {
                return {username: result.rows[0].username, is_admin: result.rows[0].is_admin}
            }
        }
        
        return false
    }
}

module.exports = User