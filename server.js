const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());

app.get("/films", (req, res) => {
  db.query("SELECT ID, name, type, link FROM film", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Lỗi khi lấy dữ liệu phim");
    }
    res.json(results);
  });
});

app.get("/combos", (req, res) => {
  db.query("SELECT ID, name, title FROM combo", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Lỗi khi lấy dữ liệu combo");
    }
    res.json(results);
  });
});

app.get("/endow", (req, res) => {
  db.query("SELECT ID, name FROM endow", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Lỗi khi lấy dữ liệu endow");
    }
    res.json(results);
  });
});

app.get("/incoming", (req, res) => {
  db.query("SELECT ID, name, type, link FROM incoming", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Lỗi khi lấy dữ liệu incoming");
    }
    res.json(results);
  });
});

app.listen(5000, () => {
  console.log("Backend chạy tại http://localhost:5000");
});
