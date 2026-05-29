DECLARE
    PROCEDURE add_airport(p_name VARCHAR2, p_city VARCHAR2, p_country VARCHAR2, p_iata VARCHAR2) IS
    BEGIN
        INSERT INTO AIRPORTS (ID, NAME, CITY, COUNTRY, IATA_CODE)
        SELECT SEQ_AIRPORTS.NEXTVAL, p_name, p_city, p_country, p_iata
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM AIRPORTS WHERE IATA_CODE = p_iata);
    END;
BEGIN
    UPDATE AIRPORTS SET CITY = 'Ciudad de Guatemala', COUNTRY = 'Guatemala' WHERE IATA_CODE = 'GUA';
    UPDATE AIRPORTS SET CITY = 'San Salvador', COUNTRY = 'El Salvador' WHERE IATA_CODE = 'SAL';
    UPDATE AIRPORTS SET CITY = 'Miami', COUNTRY = 'Estados Unidos' WHERE IATA_CODE = 'MIA';

    add_airport('Mundo Maya International Airport', 'Flores', 'Guatemala', 'FRS');
    add_airport('Benito Juarez International Airport', 'Ciudad de Mexico', 'Mexico', 'MEX');
    add_airport('John F. Kennedy International Airport', 'Nueva York', 'Estados Unidos', 'JFK');
END;
/

DECLARE
    v_origin_id NUMBER;
    v_destination_id NUMBER;
    v_airplane_id NUMBER;
    v_capacity NUMBER;
    v_flight_id NUMBER;
    v_exists NUMBER;
    v_letters VARCHAR2(6) := 'ABCDEF';

    PROCEDURE add_flight(
        p_number VARCHAR2,
        p_origin VARCHAR2,
        p_destination VARCHAR2,
        p_depart_hours NUMBER,
        p_duration_hours NUMBER,
        p_price NUMBER
    ) IS
    BEGIN
        SELECT COUNT(*) INTO v_exists FROM FLIGHTS WHERE FLIGHT_NUMBER = p_number;
        IF v_exists = 0 THEN
            SELECT ID INTO v_origin_id FROM AIRPORTS WHERE IATA_CODE = p_origin;
            SELECT ID INTO v_destination_id FROM AIRPORTS WHERE IATA_CODE = p_destination;
            SELECT ID, CAPACITY INTO v_airplane_id, v_capacity
            FROM (
                SELECT ID, CAPACITY
                FROM AIRPLANES
                WHERE AIRLINE = 'AeroNova'
                ORDER BY CAPACITY
            )
            WHERE ROWNUM = 1;

            INSERT INTO FLIGHTS (
                ID, FLIGHT_NUMBER, ORIGIN_ID, DESTINATION_ID, AIRPLANE_ID,
                DEPARTURE_TIME, ARRIVAL_TIME, PRICE, AVAILABLE_SEATS, STATUS
            )
            VALUES (
                SEQ_FLIGHTS.NEXTVAL,
                p_number,
                v_origin_id,
                v_destination_id,
                v_airplane_id,
                CAST(SYSTIMESTAMP AS TIMESTAMP) + NUMTODSINTERVAL(p_depart_hours, 'HOUR'),
                CAST(SYSTIMESTAMP AS TIMESTAMP) + NUMTODSINTERVAL(p_depart_hours + p_duration_hours, 'HOUR'),
                p_price,
                v_capacity,
                'SCHEDULED'
            )
            RETURNING ID INTO v_flight_id;

            FOR i IN 0 .. v_capacity - 1 LOOP
                INSERT INTO SEATS (ID, FLIGHT_ID, SEAT_NUMBER, AVAILABLE)
                VALUES (
                    SEQ_SEATS.NEXTVAL,
                    v_flight_id,
                    TO_CHAR(TRUNC(i / 6) + 1) || SUBSTR(v_letters, MOD(i, 6) + 1, 1),
                    1
                );
            END LOOP;
        END IF;
    END;
BEGIN
    add_flight('AN110', 'GUA', 'FRS', 20, 1, 88.00);
    add_flight('AN205', 'FRS', 'GUA', 27, 1, 82.00);
    add_flight('AN321', 'GUA', 'MEX', 34, 3, 219.00);
    add_flight('AN777', 'GUA', 'JFK', 60, 5, 399.00);
END;
/
