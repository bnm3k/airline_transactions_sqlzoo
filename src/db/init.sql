create table airplane_seat(
    seat_number integer primary key,
    customer_name varchar(50) references customer(name)
);

create table customer(
    name varchar(50) primary key
);

create table charge(
    charge_id serial primary key,
    --seat_number integer references airplane_seat not null,
    customer_name varchar(50) references customer(name),
    amount integer not null
);

insert into customer (name)
values('Alice'),('Bob'), ('Cat'), ('Deck');

insert into airplane_seat(seat_number)
select * from generate_series(1,20);