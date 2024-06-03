"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, authenticateJWT } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: Admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { title, salary, hasEquity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const data = req.body;
    console.log(data);
    const jobs = await Job.findAll(data);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** PATCH / { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { salary, hasEquity }
 *
 * Returns { title, salary, hasEquity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.body.title, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE / { title }  =>  { deleted: title }
 *
 * Authorization: admin
 */

router.delete("/", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.body.title);
    return res.json({ deleted: req.body.title });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
