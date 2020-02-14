const db = require("./db");
const chalk = require("chalk");
const _ = require("lodash");

const logSeatAssignment = ([seat, customer]) => {
    console.log(`${String(seat || "").padEnd(3, " ")} -\t${customer}`);
};

const getSeat = customerName => async db => {
    const { rows } = await db.query(
        `select min(seat_number) empty_seat 
            from airplane_seat a where a.customer_name is null`
    );
    let seatNumber = rows[0].empty_seat;
    if (seatNumber !== null) {
        await db.query(
            `update airplane_seat
            set customer_name = $1 
            where seat_number = $2`,
            [customerName, seatNumber]
        );
        await db.query(
            `insert into charge(customer_name, amount)
            values($1, 100);`,
            [customerName]
        );
    }
    return seatNumber;
};

const makeTransaction = async doSQL => {
    let serializationErrOccured = false;
    do {
        const client = await db.getClient();
        try {
            await client.query(
                "begin transaction isolation level repeatable read"
            );
            const res = await doSQL(client);
            await client.query("commit;");
            return res;
        } catch (err) {
            await client.query("rollback");
            serializationErrOccured = err.code === "40001";
            if (serializationErrOccured === false) throw err;
        } finally {
            client.release();
        }
    } while (serializationErrOccured);
};

const usePool = doSQL => doSQL(db);

const main = async () => {
    const seatsPerCustomer = 6;
    const customers = await db.getCustomerNames().then(names =>
        _(names)
            .flatMap(name => _.times(seatsPerCustomer, _.constant(name)))
            .shuffle()
            .value()
    );
    const seats = await Promise.all(
        customers.map(getSeat).map(makeTransaction)
    );

    const assignments = _.sortBy(_.zip(seats, customers), [0, 1]);
    assignments.forEach(logSeatAssignment);

    const total = await db.getTotalCharges();
    const expected = await db.getExpectedTotal();
    const color = total > expected ? chalk.red : chalk.green;
    console.log(color(`Total: ${total}\tExpected: ${expected}`));

    await db.resetValues();
};

main().catch(err => {
    console.error(err);
});
