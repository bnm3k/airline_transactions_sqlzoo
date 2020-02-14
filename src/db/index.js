require("dotenv").config();
const { Pool } = require("pg");

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

const pool = new Pool({ connectionString });

const resetValues = () =>
    pool.query(
        `delete from charge; update airplane_seat set customer_name=NULL;`
    );

const getChargesPerCustomer = async () => {
    let { rows } = await pool.query(
        `select customer_name cname, sum(amount)
                from charge group by cname`
    );
    return rows;
};

const getTotalCharges = async () => {
    let { rows } = await pool.query(
        `select coalesce(sum(amount), 0) total from charge`
    );
    let total = Number(rows[0].total);
    return total;
};

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

const getCustomerNames = async () => {
    const { rows } = await pool.query("select name from customer");
    return rows.map(({ name }) => name);
};

const getExpectedTotal = async () => {
    const { rows } = await pool.query(
        "select count(*) * 100 as expected_total from airplane_seat where customer_name is not null;"
    );
    return rows[0].expected_total;
};

module.exports = {
    query,
    getClient,
    resetValues,
    getChargesPerCustomer,
    getTotalCharges,
    getExpectedTotal,
    getCustomerNames
};
