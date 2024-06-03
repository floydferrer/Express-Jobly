"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");


const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("works for admin users: create job", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j1",
          salary: 100000,
          equity: 0.5,
          companyHandle: "c1"
        })
        .set("authorization", `Bearer ${u1Token}`);
    const result = await db.query(
        `SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE title = 'j1'`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        job: {
          title: "j1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1"
        }
    });
    expect(result.rows[0]).toEqual({
        title: "j1",
        salary: 100000,
        equity: "0.5",
        company_handle: "c1"
      });
  });

  test("unauth to create jobs", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j1",
          salary: 100000,
          equity: 0.5,
          companyHandle: "c1"
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j1",
          salary: 100000,
          equity: "0.5"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j1",
          salary: 100000,
          equity: '0.5',
          companyHandle: "c1"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                title: "t1",
                salary: 100000,
                equity: '1',
                companyHandle: "c1"
              },
              {
                title: "t3",
                salary: 250000,
                equity: '0',
                companyHandle: "c3"
              }
            ],
      });
    });
})

/************************************** PATCH /users/:username */

describe("PATCH /jobs", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .patch(`/jobs`)
          .send({
            title: "t3",
            salary: 500000,
            equity: 1
          })
          .set("authorization", `Bearer ${u1Token}`);
      const result = await db.query(
      `SELECT title, salary, equity, company_handle
          FROM jobs
          WHERE title = 't3'`);
      expect(resp.body).toEqual({
        job: {
          title: "t3",
          salary: 500000,
          equity: "1",
          companyHandle: "c3",
        },
      });
      expect(result.rows[0]).toEqual({
        title: "t3",
        salary: 500000,
        equity: "1",
        company_handle: "c3"
      });
    });
  
    test("unauth not an admin", async function () {
      const resp = await request(app)
          .patch(`/jobs`)
          .send({
            title: "t3",
            salary: 500000,
            equity: 1
          });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found on no such job", async function () {
      const resp = await request(app)
          .patch(`/jobs`)
          .send({
            title: "nope",
            salary: 500000,
            equity: 1
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("bad request on invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs`)
          .send({
            title: "nope",
            salary: "500000",
            equity: 1
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });

/************************************** DELETE /users/:username */

describe("DELETE /jobs", function () {
  test("works for auth users", async function () {
    const resp = await request(app)
        .delete(`/jobs`)
        .send({
            title: "t3"
          })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "t3" });
  });

  test("unauth to delete job", async function () {
    const resp = await request(app)
        .delete(`/jobs`)
        .send({
            title: "t3"
        })
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if job missing", async function () {
    const resp = await request(app)
        .delete(`/jobs`)
        .send({
            title: "nope"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});