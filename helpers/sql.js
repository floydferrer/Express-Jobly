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

// Using object parameter consisting of model parameters, creates SQL logic that is passed into model's update function that completes SQL update logic and updates model parameters within respective database table.

function sqlForJobFilter(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) return;
  if (dataToUpdate['title'] && typeof dataToUpdate['title'] !== 'string') throw new BadRequestError("title requires a string input");
  if (dataToUpdate['minSalary'] && typeof dataToUpdate['minSalary'] !== 'number') throw new BadRequestError("minSalary requires a number input");
  if (dataToUpdate['hasEquity'] && typeof dataToUpdate['hasEquity'] !== 'boolean') throw new BadRequestError("hasEquity requires a boolean input");
  // {title: 'TestJob', minSalary: 500000, hasEquity: true} => ['WHERE LOWER("name") LIKE $1 AND "min_salary">=$2 AND "hasEquity"= $3']
  console.log(keys);
  if (!dataToUpdate['hasEquity']) {
    hasEquityIdx = keys.indexOf('hasEquity');
    if (hasEquityIdx >= 0){
      keys.splice(hasEquityIdx, 1);
      dataToUpdate = Object.keys(dataToUpdate).filter(objKey =>
        objKey !== 'hasEquity').reduce((newObj, key) =>
        {
          newObj[key] = dataToUpdate[key];
          return newObj;
        }, {}
      );
    }
  }
  console.log(keys);
  const cols = keys.map((colName, idx) => {
    console.log(colName);
    let qry = `"${jsToSql[colName] || colName}"=$${idx + 1}`;
    if (colName === 'title') {
      return qry.replace('"title"', 'LOWER("title")').replace('=', ' LIKE ');
    } else if (colName === 'minSalary') {
      return qry.replace('=', '>=');
    } else if (colName === 'hasEquity') {
      console.log(dataToUpdate['hasEquity']);
      console.log('sdf');
      if(dataToUpdate['hasEquity']){
        return qry.replace('=', '>');  
      }
    }
  });
  console.log('here');
  console.log(cols);
  let vals = Object.values(dataToUpdate);
  if (dataToUpdate['title']) {
    const titleIdx = vals.findIndex((v) => typeof v === 'string');
    vals[titleIdx] = `%${vals[titleIdx].toLowerCase()}%`
  }
  
  console.log(dataToUpdate);
  if (dataToUpdate['hasEquity']) {
    const equityIdx = vals.findIndex((v) => typeof v === 'boolean');
    vals[equityIdx] = '0';
  }

  console.log(vals);
  return {
    setCols: cols.join(", "),
    values: vals,
  };
}

module.exports = { sqlForPartialUpdate, sqlForCompanyFilter, sqlForJobFilter };
