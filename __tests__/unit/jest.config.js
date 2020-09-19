const db = require("../../db");

const TEST_DATA = {
    testUserStatic: {
        username: "staticUser",
        password: "password",
        first_name: "Static",
        last_name: "User",
        email: "userS@test.com",
        photo_url: "http://testimageplace.com/staticuser",
        is_admin: true
    },
    testCompanyStatic: {
        handle: "STATICCO",
        name: "TheStaticCompany",
        num_employees: 1000,
        description: "Makers of static software",
        logo_url: "https://staticcotest.co"
    },
    testJobStatic: {
        title: "STATICJOB",
        salary: 100000,
        equity: 0.0,
        company_handle: "STATICCO",
        date_posted: "2020-01-01"
    },
    testUserDynamic: {
        username: "dynamicUser",
        password: "password",
        first_name: "Dynamic",
        last_name: "User",
        email: "userD@test.com",
        photo_url: "http://testimageplace.com/dynamaicUser",
        is_admin: false
    },
    testCompanyDynamic: {
        handle: "DYNAMICCO",
        name: "TheDynamicCompany",
        num_employees: 1000,
        description: "Makers of dynamic software",
        logo_url: "https://dynamiccotest.co"
    },
    testJobDynamic: {
        title: "DYNAMICJOB",
        salary: 50000,
        equity: 0.1,
        company_handle: "STATICCO",
        date_posted: "2020-01-01"
    }
}

async function performAfterAll() {
    await db.end();
}

module.exports = {
    TEST_DATA,
    performAfterAll
}