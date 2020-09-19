const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job")
const jsonschema = require("jsonschema");
const searchSchema = require("../schemas/jobSearch.json");
const createSchema = require("../schemas/jobNew.json");
const updateSchema = require("../schemas/jobUpdate.json");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");

const router = new express.Router()


router.post("/", ensureIsAdmin, async(req, res, next) => {
    try {
        const validate = jsonschema.validate(req.body, createSchema);
        if (!validate.valid) {
            //Collect all the errors in an array and throw
            const listOfErrors = validate.errors.map(e => e.stack);
            throw new ExpressError(`Unable to create a new Job: ${listOfErrors}`, 400)
        }

        const queryData = await Job.new(req.body);
        return res.json({job: queryData})
    } catch (error) {
        // if (error.code === '23505') {
        //     return next(new ExpressError(`Unable to create a new Job: Handle Already Exists`, 400))
        // }
        return next(error)
    }
})

router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        let queryData;
        // Check for query params validity
        if (Object.keys(req.query).length && jsonschema.validate(req.query, searchSchema).valid) {
            // If min and max exist, validate that max > min
            if (req.query.hasOwnProperty("min_equity")) {
                if (Number(req.query.min_equity) > 1.0) {
                    throw new ExpressError("Search Parameters are Invalid", 400)
                }
            }
            queryData = await Job.all(req.query);
        } else {
            queryData = await Job.all(null);
        }
        return res.json({jobs: queryData});
    } catch (error) {
        return next(error)
    }  
})

router.get("/:id", ensureLoggedIn, async(req, res, next) => {
    try {
        const queryData = await Job.getComp(req.params.id);

        return res.json({job: queryData})
    } catch (error) {
        return next(error)
    }
})

router.patch("/:id", ensureIsAdmin, async(req, res, next) => {
    try {
        // Validate job handle
        const oldData = await Job.get(req.params.id);
        if (!oldData) {
            throw new ExpressError(`Unable to find target job to update`, 400)
        }

        // Validate request data
        const validate = jsonschema.validate(req.body, updateSchema);
        if (!validate.valid) {
            const listOfErrors = validate.errors.map(e => e.stack);
            throw new ExpressError(`Unable to update Job: ${listOfErrors}`, 400)
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
            return res.json({job: oldData});
        }

        // Update the job data with the itemsList information
        const newData = await Job.update(req.params.id, itemsList);
        return res.json({job: newData})
    } catch (error) {
        return next(error)
    }
})

router.delete("/:id", ensureIsAdmin, async(req, res, next) => {
    try {
        const queryData = await Job.delete(req.params.id);
        if (!queryData) {
            throw new ExpressError(`Unable to delete job ${req.params.id}, record not found`, 404)
        }
        return res.json({message: `Job Deleted`});
    } catch (error) {
        return next(error)
    }
})

module.exports = router