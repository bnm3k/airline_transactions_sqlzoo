# Setting up: SQLZoo Airline seat booking

* Ensure you have  Postgres > 9.5, Node >10 and yarn installed

* At the root of the project, run `yarn install`

* Create a database and run `src/db/init.sql` to set up the tables and add the airplane seats and customer values

* Add a .env file or set the following environment variables: PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE

* Finally run the script using the command `yarn start`

* Feel free to modify the isolation level used in the `makeTransaction` function located in `src/main.js` .






