insert into customer (name)
values('Alice'),('Bob'), ('Cat'), ('Deck');

insert into airplane_seat(seat_number)
select * from generate_series(1,20);