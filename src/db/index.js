const { Pool } = require("pg");

const pool = new Pool({
    user: "bnm",
    host: "localhost",
    database: "airline",
    port: 5432
});

const reset = () =>
    pool.query(
        `delete from charge; update airplane_seat set customer_name=NULL;`
    );

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

module.exports = {
    query,
    getClient,
    reset
};
