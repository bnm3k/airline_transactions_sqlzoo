create table airplane_seat(
    seat_number integer primary key,
    customer_name varchar(50) references customer(name)
);