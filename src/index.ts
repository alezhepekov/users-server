import express from "express";
import cors from "cors";
// import pg from "pg";
import Pool from "pg-pool";
import url from "url";
import { subDays } from "date-fns";
import { User } from "./types/user";
import { Meta } from "./types/meta";
import { Utils } from "./types/utils";
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

  let query: string = "SELECT COUNT(*) FROM public.\"users\"";
  console.log(query);
  let queryData: any[] = [];
  pool.connect().then((client) => {
    client.query(query, queryData).then((data) => {
      client.release();
      meta.total = +data.rows[0].count;

      query = "SELECT * FROM public.\"users\"";
      const urlObj = url.parse(req.url, true);
      let whereCondition: string = '';
      if (urlObj.query.gender) {
        if (Array.isArray(urlObj.query.gender) && urlObj.query.gender.length > 0) {
          whereCondition += `\"gender\" IN (`;
          whereCondition += urlObj.query.gender
            .map(value => `'${value}'`)
            .join(',');
          whereCondition += ')';
        } else {
          whereCondition += `\"gender\" = '${urlObj.query.gender}'`;
        }
      }
      if (urlObj.query.accountType) {
        if (whereCondition.length > 0) {
          whereCondition += ' AND ';
        }
        if (Array.isArray(urlObj.query.accountType) && urlObj.query.accountType.length > 0) {
          whereCondition += `\"accountType\" IN (`;
          whereCondition += urlObj.query.accountType
            .map(value => `'${value}'`)
            .join(',');
          whereCondition += ')';
        } else {
          whereCondition += `\"accountType\" = '${urlObj.query.accountType}'`;
        }
      }
      if (whereCondition.length > 0) {
        query += ` WHERE ${whereCondition}`;
      }

      let sortFieldDefault: string = "id";
      let sortOrderDefault: string = "ASC";
      if (urlObj.query.sortField !== "null" && urlObj.query.sortOrder !== "null") {
        query += ` ORDER BY \"${urlObj.query.sortField}\" ${urlObj.query.sortOrder === "ascend" ? "ASC" : "DESC"}`;
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
            users.push({
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              middleName: currentUser.middleName,
              dateOfBirth: currentUser.dateOfBirth,
              gender: currentUser.gender,
              email: currentUser.email,
              phone: currentUser.phone,
              address: currentUser.address,
              password: currentUser.password,
              accountType: currentUser.accountType,
              picture: currentUser.picture,
              creationTime: currentUser.creationTime,
              lastAccessTime: currentUser.lastAccessTime
            });
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

app.get("/api/users/:id", (req, res) => {
  let query = `SELECT * FROM public.\"users\" WHERE \"id\" = '${req.params.id}'`;
  let queryData: any[] = [];
  pool.connect().then((client) => {
    client.query(query, queryData).then((data) => {
      client.release();
      if (data?.rows?.length > 0) {
        const user = data?.rows[0];
        res.status(200).json({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          email: user.email,
          phone: user.phone,
          address: user.address,
          password: user.password,
          accountType: user.accountType,
          picture: user.picture,
          creationTime: user.creationTime,
          lastAccessTime: user.lastAccessTime
        });
      } else {
        res.status(404).json({
          result: "error",
          message: `Error: User with id = ${req.params.id} not found.`
        })
      }
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
      INSERT INTO public."users"("firstName","lastName","middleName","dateOfBirth","gender","email","phone","address","password","accountType","picture","creationTime","lastAccessTime")
      VALUES ('${name}',NULL,NULL,'${dateOfBirth}','${gender}','user.${i + 1}@my.org','+${i + 1}',NULL,'${i + 1}','${accuntType}',NULL,now(),now());
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
