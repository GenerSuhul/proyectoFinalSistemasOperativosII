DECLARE
    PROCEDURE add_airport(p_name VARCHAR2, p_city VARCHAR2, p_country VARCHAR2, p_iata VARCHAR2) IS
    BEGIN
        INSERT INTO AIRPORTS (ID, NAME, CITY, COUNTRY, IATA_CODE)
        SELECT SEQ_AIRPORTS.NEXTVAL, p_name, p_city, p_country, p_iata
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM AIRPORTS WHERE IATA_CODE = p_iata);
    END;

    PROCEDURE add_airplane(p_model VARCHAR2, p_capacity NUMBER, p_airline VARCHAR2) IS
    BEGIN
        INSERT INTO AIRPLANES (ID, MODEL, CAPACITY, AIRLINE)
        SELECT SEQ_AIRPLANES.NEXTVAL, p_model, p_capacity, p_airline
        FROM DUAL
        WHERE NOT EXISTS (
            SELECT 1 FROM AIRPLANES WHERE MODEL = p_model AND AIRLINE = p_airline
        );
    END;
BEGIN
    add_airport('La Aurora International Airport', 'Ciudad de Guatemala', 'Guatemala', 'GUA');
    add_airport('El Salvador International Airport', 'San Salvador', 'El Salvador', 'SAL');
    add_airport('Miami International Airport', 'Miami', 'Estados Unidos', 'MIA');
    add_airport('Tocumen International Airport', 'Panama', 'Panama', 'PTY');
    add_airport('El Dorado International Airport', 'Bogota', 'Colombia', 'BOG');
    add_airport('Jose Maria Cordova International Airport', 'Medellin', 'Colombia', 'MDE');
    add_airport('Cancun International Airport', 'Cancun', 'Mexico', 'CUN');
    add_airport('Juan Santamaria International Airport', 'San Jose', 'Costa Rica', 'SJO');
    add_airport('Adolfo Suarez Madrid-Barajas Airport', 'Madrid', 'Espana', 'MAD');
    add_airport('Jorge Chavez International Airport', 'Lima', 'Peru', 'LIM');

    add_airplane('Airbus A320neo', 60, 'AeroNova');
    add_airplane('Boeing 787-9 Dreamliner', 72, 'AeroNova');
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
        p_airplane_model VARCHAR2,
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
            FROM AIRPLANES
            WHERE MODEL = p_airplane_model AND AIRLINE = 'AeroNova'
            FETCH FIRST 1 ROW ONLY;

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
    add_flight('AN410', 'GUA', 'SAL', 'Airbus A320neo', 28, 1, 96.00);
    add_flight('AN520', 'GUA', 'PTY', 'Airbus A320neo', 32, 2, 148.00);
    add_flight('AN730', 'GUA', 'BOG', 'Airbus A320neo', 36, 4, 238.15);
    add_flight('AN905', 'GUA', 'MIA', 'Airbus A320neo', 42, 3, 266.01);
    add_flight('AN612', 'GUA', 'CUN', 'Airbus A320neo', 48, 2, 184.50);
    add_flight('AN818', 'GUA', 'SJO', 'Airbus A320neo', 54, 2, 162.75);
    add_flight('AN990', 'GUA', 'MAD', 'Boeing 787-9 Dreamliner', 72, 11, 673.60);
    add_flight('AN334', 'GUA', 'LIM', 'Airbus A320neo', 80, 5, 337.35);
    add_flight('AN741', 'BOG', 'GUA', 'Airbus A320neo', 58, 4, 229.90);
    add_flight('AN613', 'CUN', 'GUA', 'Airbus A320neo', 68, 2, 179.25);
END;
/
