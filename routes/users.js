const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const createSchema = require("../schemas/userNew.json");
const updateSchema = require("../schemas/userUpdate.json")

const router = new express.Router()


// ╔═══╗╔═══╗╔═══╗╔═══╗╔════╗╔═══╗
// ║╔═╗║║╔═╗║║╔══╝║╔═╗║║╔╗╔╗║║╔══╝
// ║║ ╚╝║╚═╝║║╚══╗║║ ║║╚╝║║╚╝║╚══╗
// ║║ ╔╗║╔╗╔╝║╔══╝║╚═╝║  ║║  ║╔══╝
// ║╚═╝║║║║╚╗║╚══╗║╔═╗║ ╔╝╚╗ ║╚══╗
// ╚═══╝╚╝╚═╝╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝

router.post("/", async(req, res, next) => {
    try {
        const validate = jsonschema.validate(req.body, createSchema);
        if (!validate.valid) {
            console.log("Not Valid")
            //Collect all the errors in an array and throw
            const listOfErrors = validate.errors.map(e => e.stack);
            throw new ExpressError(`Unable to create a new User: ${listOfErrors}`, 400)
        }

        const queryData = await User.new(req.body);
        return res.json({user: queryData})
    } catch (error) {
        if (error.code === '23505') {
            return next(new ExpressError(`Unable to create a new User: Username/Email Taken`, 400))
        }
        return next(error)
    }
})


// ╔═══╗╔═══╗╔═══╗╔═══╗
// ║╔═╗║║╔══╝║╔═╗║╚╗╔╗║
// ║╚═╝║║╚══╗║║ ║║ ║║║║
// ║╔╗╔╝║╔══╝║╚═╝║ ║║║║
// ║║║╚╗║╚══╗║╔═╗║╔╝╚╝║
// ╚╝╚═╝╚═══╝╚╝ ╚╝╚═══╝   

// All
router.get("/", async (req, res, next) => {
    try {
        const queryData = await User.all();
        return res.json({users: queryData});
    } catch (error) {
        return next(error)
    }  
})

// By Username
router.get("/:username", async(req, res, next) => {
    try {
        const queryData = await User.get(req.params.username);

        return res.json({user: queryData})
    } catch (error) {
        return next(error)
    }
})


// ╔╗ ╔╗╔═══╗╔═══╗╔═══╗╔════╗╔═══╗
// ║║ ║║║╔═╗║╚╗╔╗║║╔═╗║║╔╗╔╗║║╔══╝
// ║║ ║║║╚═╝║ ║║║║║║ ║║╚╝║║╚╝║╚══╗
// ║║ ║║║╔══╝ ║║║║║╚═╝║  ║║  ║╔══╝
// ║╚═╝║║║   ╔╝╚╝║║╔═╗║ ╔╝╚╗ ║╚══╗
// ╚═══╝╚╝   ╚═══╝╚╝ ╚╝ ╚══╝ ╚═══╝

router.patch("/:username", async(req, res, next) => {
    try {
        // Validate user username
        const oldData = await User.get(req.params.username);
        if (!oldData) {
            throw new ExpressError(`Unable to find target user to update`, 400)
        }

        // Validate request data
        const validate = jsonschema.validate(req.body, updateSchema);
        if (!validate.valid) {
            const listOfErrors = validate.errors.map(e => e.stack);
            throw new ExpressError(`Unable to update User: ${listOfErrors}`, 400)
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
            return res.json({user: oldData});
        }

        // Update the user data with the itemsList information
        const newData = await User.update(req.params.username, itemsList);
        return res.json({user: newData})
    } catch (error) {
        return next(error)
    }
})


// ╔═══╗╔═══╗╔╗   ╔═══╗╔════╗╔═══╗
// ╚╗╔╗║║╔══╝║║   ║╔══╝║╔╗╔╗║║╔══╝
//  ║║║║║╚══╗║║   ║╚══╗╚╝║║╚╝║╚══╗
//  ║║║║║╔══╝║║ ╔╗║╔══╝  ║║  ║╔══╝
// ╔╝╚╝║║╚══╗║╚═╝║║╚══╗ ╔╝╚╗ ║╚══╗
// ╚═══╝╚═══╝╚═══╝╚═══╝ ╚══╝ ╚═══╝

router.delete("/:username", async(req, res, next) => {
    try {
        const queryData = await User.delete(req.params.username);
        if (!queryData) {
            throw new ExpressError(`Unable to delete user ${req.params.username}, record not found`, 404)
        }
        return res.json({message: `User ${queryData.username} Deleted`});
    } catch (error) {
        return next(error)
    }
})

module.exports = router