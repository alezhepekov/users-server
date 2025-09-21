import express from "express";
import cors from "cors";
// import pg from "pg";
import Pool from "pg-pool";
import url from "url";
import { subDays } from "date-fns";
import { User } from "./types/user";
import { Meta } from "./types/meta";
import { Utils } from "./types/utils";
import fieldsMap from "./types/fields-map.json";
import config from "../config.json";

process.on("uncaughtException", (err) => {
  console.error("Error", err.message, err.stack);
});

const dbConfig = {
    user: config.db.user,
    password: config.db.userPassword,
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    ssl: false
  };
const pool = new Pool(dbConfig);

const app = express();
app.use(cors());

app.get("/api/users", (req, res) => {
  const urlObj = url.parse(req.url, true);

  let users: User[] = [];
  let meta: Meta = {
    pageIndex: 1,
    pageSize: 10,
    total: 0
  };

  let query: string = "SELECT COUNT(*) FROM public.\"USERS\"";
  console.log(query);
  let queryData: any[] = [];
  pool.connect().then((client) => {
    client.query(query, queryData).then((data) => {
      client.release();
      meta.total = +data.rows[0].count;

      query = "SELECT * FROM public.\"USERS\"";
      const urlObj = url.parse(req.url, true);
      if (urlObj.query.gender) {
        if (Array.isArray(urlObj.query.gender) && urlObj.query.gender.length > 0) {
          query += ` WHERE \"${fieldsMap["gender"]}\" IN (`;
          query += urlObj.query.gender
            .map(value => `'${value}'`)
            .join(',');
          query += ')';
        } else {
          query += ` WHERE \"${fieldsMap["gender"]}\" = '${urlObj.query.gender}'`;
        }
      }
      if (urlObj.query.accountType) {
        if (Array.isArray(urlObj.query.accountType) && urlObj.query.accountType.length > 0) {
          query += ` WHERE \"${fieldsMap["accountType"]}\" IN (`;
          query += urlObj.query.accountType
            .map(value => `'${value}'`)
            .join(',');
          query += ')';
        } else {
          query += ` WHERE \"${fieldsMap["accountType"]}\" = '${urlObj.query.accountType}'`;
        }
      }

      let sortFieldDefault: string = "ID";
      let sortOrderDefault: string = "ASC";
      if (urlObj.query.sortField !== "null" && urlObj.query.sortOrder !== "null") {
        query += ` ORDER BY \"${fieldsMap[urlObj.query.sortField as string]}\" ${urlObj.query.sortOrder === "ascend" ? "ASC" : "DESC"}`;
      } else {
        query += ` ORDER BY \"${sortFieldDefault}\" ${sortOrderDefault}`;
      }

      if (urlObj.query.pageIndex && urlObj.query.pageSize) {
        const pageIndex: number = +urlObj.query.pageIndex;
        const pageSize: number = +urlObj.query.pageSize;
        query += ` OFFSET ${(pageIndex - 1) * pageSize} LIMIT ${pageSize}`;
        meta.pageIndex = pageIndex;
        meta.pageSize = pageSize;
      }
      console.log(query);
      queryData = [];
      pool.connect().then((client) => {
        client.query(query, queryData).then((data) => {
          client.release();
          data?.rows?.forEach((currentUser) => {
            users.push(
              {
                id: currentUser.ID,
                firstName: currentUser.FIRST_NAME,
                lastName: currentUser.LAST_NAME,
                middleName: currentUser.MIDDLE_NAME,
                dateOfBirth: currentUser.DATE_OF_BIRTH,
                gender: currentUser.GENDER,
                email: currentUser.EMAIL,
                phone: currentUser.PHONE,
                address: currentUser.ADDRESS,
                password: currentUser.PASSWORD,
                accountType: currentUser.ACCOUNT_TYPE,
                data: currentUser.DATA,
                picture: currentUser.PICTURE,
                creationTime: currentUser.CREATION_TIME,
                lastAccessTime: currentUser.LAST_ACCESS_TIME
              }
            );
          });
          res.status(200).json({
            users: users,
            meta: meta
          });
        })
        .catch((err) => {
          client.release();
          console.error("Query error", err.message, err.stack);
          res.status(500).json({
            result: "error",
            message: err.message
          });
        });
      });
    })
    .catch((err) => {
      client.release();
      console.error("Query error", err.message, err.stack);
      res.status(500).json({
        result: "error",
        message: err.message
      });
    });
  });
});

app.post("/api/fill-users-table", (req, res) => {
  const manNames: string[] = ["Oliver", "Jack", "Harry", "Jacob", "George", "Noah", "Charlie", "Thomas", "Oscar", "William", "James", "Alexey", "Alexander", "Jhon", "Mike"];
  const womanNames: string[] = ["Olivia", "Amelia", "Isla", "Ava", "Emily"];
  const accuntTypes: string[] = ["ADMIN", "NORMAL", "GUEST"];

  let query = "";
  for (let i = 0; i < config.db.insertLimit; i++) {
    const dateOfBirth: string = subDays(new Date(), Utils.randomIntFromInterval(0, 100 * 365)).toISOString();
    const gender: string = i % 2 === 0 ? "MALE" : "FEMALE";
    const name: string = i % 2 === 0 ? manNames[Utils.randomIntFromInterval(0, manNames.length - 1)] : womanNames[Utils.randomIntFromInterval(0, womanNames.length - 1)];
    const accuntType: string = accuntTypes[Utils.randomIntFromInterval(0, accuntTypes.length - 1)];
    query += `
      INSERT INTO public."USERS"("FIRST_NAME","LAST_NAME","MIDDLE_NAME","DATE_OF_BIRTH","GENDER","EMAIL","PHONE","ADDRESS","PASSWORD","ACCOUNT_TYPE","DATA","PICTURE","CREATION_TIME","LAST_ACCESS_TIME")
      VALUES ('${name}',NULL,NULL,'${dateOfBirth}','${gender}','user.${i + 1}@myorg.net','+${i + 1}',NULL,'${i + 1}','${accuntType}',NULL,NULL,now(),now());
    `;
  }
  let queryData: any[] = [];
  pool.connect().then((client) => {
    client.query(query, queryData).then((data) => {
      client.release();
      res.status(200).json({
        result: "success"
      });
    })
    .catch((err) => {
      client.release();
      console.error("Query error", err.message, err.stack);
      res.status(500).json({
        result: "error",
        message: err.message
      });
    });
  });
});

app.listen(config.port, () => {
  console.log(`Server listening at http://localhost:${config.port}`);
});
