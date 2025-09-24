CREATE SEQUENCE public."usersIdSeq"
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE public."usersIdSeq"
  OWNER TO postgres;


CREATE TABLE public."users"
(
  "id" bigint NOT NULL DEFAULT nextval('"usersIdSeq"'::regclass),
  "firstName" character varying(512) NOT NULL,
  "lastName" character varying(512),
  "middleName" character varying(512),
  "dateOfBirth" timestamp without time zone NOT NULL,
  "gender" character varying(6) NOT NULL,
  "email" character varying(1024) NOT NULL,
  "phone" character varying(32),
  "address" character varying(4096),
  "password" character varying(128) NOT NULL,
  "accountType" character varying(64) NOT NULL,
  "picture" character varying(4096),
  "creationTime" timestamp without time zone DEFAULT (now())::timestamp without time zone,
  "lastAccessTime" timestamp without time zone,
  CONSTRAINT "usersIdPK" PRIMARY KEY ("id"),
  CONSTRAINT "usersEmailUnIdx" UNIQUE ("email"),
  CONSTRAINT "usersPhoneUnIdx" UNIQUE ("phone")
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public."users"
  OWNER TO postgres;

CREATE INDEX "usersFirstNameIdx" ON public."users" USING BTREE ("firstName");
CREATE INDEX "usersDateOfBirthIdx" ON public."users" USING BTREE ("dateOfBirth");
CREATE INDEX "usersGenderIdx" ON public."users" USING BTREE ("gender");
CREATE INDEX "usersAccountTypeIdx" ON public."users" USING BTREE ("accountType");
