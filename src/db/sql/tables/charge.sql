create table charge(
    charge_id serial primary key,
    --seat_number integer references airplane_seat not null,
    customer_name varchar(50) references customer(name),
    amount integer not null
);