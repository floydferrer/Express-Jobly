"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "test-job1",
    salary: 100000,
    equity: 1,
    companyHandle: "c3"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job.title).toEqual(newJob.title);
    expect(job.salary).toEqual(newJob.salary);
    expect(job.equity).toEqual(newJob.equity.toString());
    expect(job.companyHandle).toEqual(newJob.companyHandle);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'test-job1'`);
    expect(result.rows).toEqual([
      {
        title: "test-job1",
        salary: 100000,
        equity: '1',
        company_handle: "c3"
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        company_handle: "c1",
        equity: "1",
        salary: 100000,
        title: "t1"
      },
      {
        company_handle: "c2",
        equity: "0.5",
        salary: 200000,
        title: "t2"
      },
      {
        company_handle: "c3",
        equity: "0",
        salary: 250000,
        title: "t3"
      }
    ]);
  });
  test("works: title filter", async function () {
    let jobs = await Job.findAll({"title": "t2"});
    expect(jobs).toEqual([
      {
        company_handle: "c2",
        equity: "0.5",
        salary: 200000,
        title: "t2"
      }
    ]);
  });
  test("works: minSalary filter", async function () {
    let jobs = await Job.findAll({"minSalary": 105000});
    expect(jobs).toEqual([
      {
        company_handle: "c2",
        equity: "0.5",
        salary: 200000,
        title: "t2"
      },
      {
        company_handle: "c3",
        equity: "0",
        salary: 250000,
        title: "t3"
      }
    ]);
  });
  test("works: hasEquity filter", async function () {
    let jobs = await Job.findAll({"hasEquity": true});
    expect(jobs).toEqual([
      {
        company_handle: "c1",
        equity: "1",
        salary: 100000,
        title: "t1"
      },
      {
        company_handle: "c2",
        equity: "0.5",
        salary: 200000,
        title: "t2"
      }
    ]);
  });
});


/************************************** update */

describe("update", function () {
  const updateData = {
    salary: 202000,
    equity: 0.2
  };

  test("works", async function () {
    let job = await Job.update("t1", updateData);
    expect(job.title).toEqual("t1");
    expect(job.salary).toEqual(202000);
    expect(job.equity).toEqual("0.2");
    expect(job.company_handle).toEqual("c1")

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 't1'`);
    expect(result.rows).toEqual([{
      title: "t1",
      salary: 202000,
      equity: "0.2",
      company_handle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      salary: 202000,
      equity: null
    };

    let job = await Job.update("t1", updateDataSetNulls);
    expect(job.title).toEqual("t1");
    expect(job.salary).toEqual(202000);
    expect(job.equity).toEqual(null);
    expect(job.company_handle).toEqual("c1");

    const result = await db.query(
        `SELECT title, salary, equity, company_handle
         FROM jobs
         WHERE title = 't1'`);
    expect(result.rows).toEqual([{
        title: "t1",
        salary: 202000,
        equity: null,
        company_handle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("t1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("t1");
    const res = await db.query(
        "SELECT title FROM jobs WHERE title='t1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
