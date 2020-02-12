const db = require("./db");
const chalk = require("chalk");

const ErrNoSeatsAvailable = new Error("No seats available");

const timer = ms =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

const randInt = (min, max) => Math.random() * (max - min + 1) + min;

const book = async customerName => {
    const { rows } = await db.query(
        `select min(seat_number) empty_seat 
            from airplane_seat a where a.customer_name is null`
    );
    let emptySeatNumber = rows[0].empty_seat;
    if (emptySeatNumber === null) throw ErrNoSeatsAvailable;
    await db.query(
        `update airplane_seat
            set customer_name = $1 
            where seat_number = $2`,
        [customerName, emptySeatNumber]
    );
    await db.query(
        `insert into charge(customer_name, amount)
            values($1, 100);`,
        [customerName]
    );
};

const bookTx = async customerName => {
    const client = await db.getClient();
    try {
        await client.query("begin transaction isolation level repeatable read");
        const { rows } = await client.query(
            `select min(seat_number) empty_seat 
                from airplane_seat a where a.customer_name is null`
        );
        let emptySeatNumber = rows[0].empty_seat;
        if (emptySeatNumber === null) throw ErrNoSeatsAvailable;
        await client.query(
            `update airplane_seat
                set customer_name = $1 
                where seat_number = $2`,
            [customerName, emptySeatNumber]
        );
        await client.query(
            `insert into charge(customer_name, amount)
                values($1, 100);`,
            [customerName]
        );
        await client.query("commit;");
        console.log(
            chalk.green(`${customerName} gets seat ${emptySeatNumber}`)
        );
    } catch (err) {
        await client.query("rollback");
        if (err === ErrNoSeatsAvailable)
            console.error(chalk.red(`No seats available [${customerName}]`));
        else console.error(chalk.red(err.message));
        //throw err;
    } finally {
        client.release();
    }
};

const bookPlusLogOut = async customerName => {
    try {
        await book(customerName);
        console.log(
            chalk.green(`${customerName} gets seat ${emptySeatNumber}`)
        );
    } catch (err) {
        if (err === ErrNoSeatsAvailable)
            console.error(chalk.red("No seats available"));
        else console.error(chalk.red(err.message));
    }
};

const bookMultipleSeats = async (customerName, n, bookFn = book) => {
    let bookings = [];
    while (n > 0) {
        bookings.push(bookFn(customerName));
        n--;
    }
    await Promise.all(bookings);
};

const getChargesPerCustomer = async () => {
    let { rows } = await db.query(
        `select customer_name cname, sum(amount)
            from charge group by cname`
    );
    console.log(
        chalk.gray(`${"NAME".padEnd(10, " ")}   ${"CHARGE".padStart(5, " ")}`)
    );
    rows.forEach(({ cname, sum }) => {
        console.log(`${cname.padEnd(10, " ")} - ${sum.padStart(5, " ")}`);
    });
};

const getTotalCharges = async () => {
    let { rows } = await db.query(
        `select coalesce(sum(amount), 0) total from charge`
    );
    let total = Number(rows[0].total);
    let totalFmtd = total > 2000 ? chalk.red(total) : chalk.green(total);
    console.log(`Total charges: ${totalFmtd}`);
};

const main = async () => {
    await Promise.all(
        ["Alice", "Bob", "Becky"].map(name =>
            bookMultipleSeats(name, 20, bookTx)
        )
    );
    await getTotalCharges();
    await getChargesPerCustomer();
    //await db.reset();
};

main().catch(err => {
    console.error(err);
});
