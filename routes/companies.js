const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const searchSchema = require("../schemas/companySearch.json");
const createSchema = require("../schemas/companyNew.json");
const updateSchema = require("../schemas/companyUpdate.json");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");

const router = new express.Router()


router.post("/", ensureIsAdmin, async(req, res, next) => {
    try {
        const validate = jsonschema.validate(req.body, createSchema);
        if (!validate.valid) {
            //Collect all the errors in an array and throw
            const listOfErrors = validate.errors.map(e => e.stack);
            throw new ExpressError(`Unable to create a new Company: ${listOfErrors}`, 400)
        }

        const companyData = await Company.new(req.body);
        return res.json({company: companyData})
    } catch (error) {
        if (error.code === '23505') {
            return next(new ExpressError(`Unable to create a new Company: Handle Already Exists`, 400))
        }
        return next(error)
    }
})

router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        let companyData;
        // Check for query params validity
        if (Object.keys(req.query).length && jsonschema.validate(req.query, searchSchema).valid) {
            // If min and max exist, validate that max > min
            if (req.query.hasOwnProperty("min_employees") && req.query.hasOwnProperty("max_employees")) {
                if (req.query.min_employees > req.query.max_employees) {
                    throw new ExpressError("Search Parameters are Invalid", 400)
                }
            }
            companyData = await Company.all(req.query);
        } else {
            companyData = await Company.all(null);
        }
        return res.json({companies: companyData});
    } catch (error) {
        return next(error)
    }  
})


router.get("/:handle", ensureLoggedIn, async(req, res, next) => {
    try {
        const companyData = await Company.getJobs(req.params.handle);

        return res.json({company: companyData})
    } catch (error) {
        return next(error)
    }
})

router.patch("/:handle", ensureIsAdmin, async(req, res, next) => {
    try {
        // Validate company handle
        const oldData = await Company.get(req.params.handle);
        if (!oldData) {
            throw new ExpressError(`Unable to find target company to update`, 400)
        }

        // Validate request data
        const validate = jsonschema.validate(req.body, updateSchema);
        if (!validate.valid) {
            const listOfErrors = validate.errors.map(e => e.stack);
            throw new ExpressError(`Unable to update Company: ${listOfErrors}`, 400)
        }

        // Build update list for patch query
        let itemsList = {};
        const newKeys = Object.keys(req.body);
        newKeys.map(key => {
            if((req.body.hasOwnProperty(key) && oldData.hasOwnProperty(key)) && (req.body[key] != oldData[key])) {
                itemsList[key] = req.body[key];
            }
        })
        
        // If no changes return original data
        if(Object.keys(itemsList).length === 0) {
            return res.json({company: oldData});
        }

        // Update the company data with the itemsList information
        const newData = await Company.update(req.params.handle, itemsList);
        return res.json({company: newData})
    } catch (error) {
        return next(error)
    }
})

router.delete("/:handle", ensureIsAdmin, async(req, res, next) => {
    try {
        const companyHandle = await Company.delete(req.params.handle);
        if (!companyHandle) {
            throw new ExpressError(`Unable to delete company ${req.params.handle}, record not found`, 404)
        }
        return res.json({message: `Company ${companyHandle.handle} Deleted`});
    } catch (error) {
        return next(error)
    }
})

module.exports = router