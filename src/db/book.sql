create function book(u_customer_name varchar)
    returns boolean
    language 'plpgsql'
as $$
declare
    empty_seat integer;
begin
    select min(seat_number) into empty_seat
        from airplane_seat a where a.customer_name is null;
    if empty_seat is null then 
        return 'f';
    end if;
    update airplane_seat
        set customer_name = u_customer_name where seat_number = empty_seat;
    insert into charge(customer_name, amount)
        values(u_customer_name, 100);
    return 't';
end;
$$;
