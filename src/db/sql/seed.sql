insert into customer (name)
values('Alice'),('Bob');

insert into airplane_seat(seat_number)
select * from generate_series(1,20);