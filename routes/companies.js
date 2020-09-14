const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");


const router = new express.Router()


router.get("/", async (req, res, next) => {
    try {
        // Need to add search parameter validations
        if (req.query.length) {
        }
        const companyData = await Company.all(null);
        console.log(companyData)
        return {companies: companyData};
    } catch (error) {
        return next(error)
    }  
})

module.exports = router