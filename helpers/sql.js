const { BadRequestError } = require("../expressError");

// Using object parameter consisting of model parameters, creates SQL logic that is passed into model's update function that completes SQL update logic and updates model parameters within respective database table.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");
  if (typeof dataToUpdate['name'] !== 'string') throw new BadRequestError("name requires a string input");
  if (typeof dataToUpdate['minEmployees'] !== 'number') throw new BadRequestError("minEmployees requires a number input");
  if (typeof dataToUpdate['maxEmployees'] !== 'number') throw new BadRequestError("maxEmployees requires a number input");
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
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
  // const cols = keys.map((colName, idx) =>
  //     `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  // );
  console.log(cols);
  let vals = Object.values(dataToUpdate);
  console.log(vals);
  const nameIdx = vals.findIndex((v) => typeof v === 'string');
  vals[nameIdx] = `%${vals[nameIdx].toLowerCase()}%`
  return {
    setCols: cols.join(", "),
    values: vals,
  };
}

module.exports = { sqlForPartialUpdate };
