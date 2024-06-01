const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("SQL data", function () {
    test("Creates SQL data", function () {
        const data = {
            firstName: 'test',
            lastName: 'user',
            isAdmin: true
        }
        const js = {
            firstName: 'first_name',
            lastName: 'last_name',
            isAdmin: 'is_admin',
          }
        const res = sqlForPartialUpdate(data, js)
        console.log(res.setCols);
      expect(res.setCols.replaceAll('"', "'")).toEqual("'first_name'=$1, 'last_name'=$2, 'is_admin'=$3")
    });
})