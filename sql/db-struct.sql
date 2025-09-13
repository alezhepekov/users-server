CREATE SEQUENCE public."USERS_ID_SEQ"
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
ALTER TABLE public."USERS_ID_SEQ"
    OWNER TO postgres;


CREATE TABLE public."USERS"
(
    "ID" bigint NOT NULL DEFAULT nextval('"USERS_ID_SEQ"'::regclass),
    "FIRST_NAME" character varying(512),
    "LAST_NAME" character varying(512),
    "MIDDLE_NAME" character varying(512),
    "DATE_OF_BIRTH" timestamp without time zone,
    "GENDER" character varying(6),
    "EMAIL" character varying(1024) NOT NULL,
    "PHONE" character varying(32),
    "ADDRESS" character varying(4096),
    "PASSWORD" character varying(128) NOT NULL,
    "ACCOUNT_TYPE" character varying(64) NOT NULL,
    "DATA" jsonb,
    "PICTURE" character varying(4096),
    "CREATION_TIME" timestamp without time zone DEFAULT (now())::timestamp without time zone,
    "LAST_ACCESS_TIME" timestamp without time zone,
    CONSTRAINT "USERS_ID_PK" PRIMARY KEY ("ID"),
    CONSTRAINT "USERS_EMAIL_UN" UNIQUE ("EMAIL"),
    CONSTRAINT "USERS_PHONE_UN" UNIQUE ("PHONE")
)
WITH (
    OIDS=FALSE
);
ALTER TABLE public."USERS"
    OWNER TO postgres;