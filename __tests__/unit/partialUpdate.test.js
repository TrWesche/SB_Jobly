process.env.NODE_ENV = "test";
const sqlForPartialUpdate = require("../../helpers/partialUpdate")

const inTestTableName = "test_table";
const inItemsList1 = {
  "test_col1": 6,
};
const inItemsList2 = {
  "test_col1": 6,
  "test_col2": "yellow",
  "_hidden_col1": "hidden"
};
const inQueryKey = "query_col";
const inQueryID = 0;

const outQueryTest1 = "UPDATE test_table SET test_col1=$1 WHERE query_col=$2 RETURNING *";
const outValuesTest1 = [6, 0];

const outQueryTest2 = "UPDATE test_table SET test_col1=$1, test_col2=$2 WHERE query_col=$3 RETURNING *";
const outValuesTest2 = [6, "yellow", 0];

describe("partialUpdate()", () => {
  test("Can generate a partial update query with just 1 field", () => {
    const { query, values } = sqlForPartialUpdate(inTestTableName, inItemsList1, inQueryKey, inQueryID);
    expect(query).toEqual(outQueryTest1);
    expect(values).toEqual(outValuesTest1)
  })

  test("Can generate a partial update query with multiple fields not including those prepended by '_' ", () => {
    const { query, values } = sqlForPartialUpdate(inTestTableName, inItemsList2, inQueryKey, inQueryID);
    expect(query).toEqual(outQueryTest2);
    expect(values).toEqual(outValuesTest2)
  })
});
