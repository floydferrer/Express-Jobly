const { BadRequestError } = require("../expressError");

// Using object parameter consisting of model parameters, creates SQL logic that is passed into model's update function that completes SQL update logic and updates model parameters within respective database table.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );
  // const cols = keys.map((colName, idx) =>
  //     `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  // );
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate)
  };
}

// Using object parameter consisting of model parameters, creates SQL logic that is passed into model's update function that completes SQL update logic and updates model parameters within respective database table.

function sqlForCompanyFilter(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) return;
  if (dataToUpdate['name'] && typeof dataToUpdate['name'] !== 'string') throw new BadRequestError("name requires a string input");
  if (dataToUpdate['minEmployees'] && typeof dataToUpdate['minEmployees'] !== 'number') throw new BadRequestError("minEmployees requires a number input");
  if (dataToUpdate['maxEmployees'] && typeof dataToUpdate['maxEmployees'] !== 'number') throw new BadRequestError("maxEmployees requires a number input");
  // {name: 'An', minEmployees: 10, maxEmployees: 500} => ['WHERE LOWER("name") LIKE $1 AND "num_employees">=$2 AND "num_employees"<= $3']
  const cols = keys.map((colName, idx) => {
    let qry = `"${jsToSql[colName] || colName}"=$${idx + 1}`;
    if (colName === 'name') {
      return qry.replace('"name"', 'LOWER("name")').replace('=', ' LIKE ');
    } else if (colName === 'minEmployees') {
      return qry.replace('=', '>=');
    } else if (colName === 'maxEmployees') {
      return qry.replace('=', '<=');
    } return qry;
  });
  let vals = Object.values(dataToUpdate);
  if (dataToUpdate['name']) {
    const nameIdx = vals.findIndex((v) => typeof v === 'string');
    vals[nameIdx] = `%${vals[nameIdx].toLowerCase()}%`
  }
  return {
    setCols: cols.join(", "),
    values: vals,
  };
}

module.exports = { sqlForPartialUpdate, sqlForCompanyFilter };
