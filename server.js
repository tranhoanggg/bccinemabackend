const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

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

app.get("/goods", (req, res) => {
  db.query(
    "SELECT ID, name, description, price, discount FROM goods",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Lỗi khi lấy dữ liệu incoming");
      }
      res.json(results);
    }
  );
});

app.post("/api/profile", (req, res) => {
  const { name, gender, email, password, phone, birthday } = req.body;

  const sql = `
    INSERT INTO profile (name, gender, email, password, phone, birthday)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, gender, email, password, phone, birthday],
    (err, result) => {
      if (err) {
        console.error("Lỗi thêm dữ liệu:", err);
        return res.status(500).json({ message: "Lỗi server" });
      }
      res.status(200).json({ message: "Đăng ký thành công" });
    }
  );
});

app.post("/api/profile/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ dùng db.promise().query thay vì db.query
    const [rows] = await db
      .promise()
      .query("SELECT * FROM profile WHERE email = ? AND password = ? LIMIT 1", [
        email,
        password,
      ]);

    if (rows.length > 0) {
      res.json({ user: rows[0] });
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }
  } catch (err) {
    console.error("Lỗi khi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

app.get("/endow/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      ID,
      name,
      detail,
      DATE_FORMAT(day, '%d/%m/%Y') AS day
    FROM endow
    WHERE ID = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn endow theo ID:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy endow" });
    }
    res.json(results[0]);
  });
});

app.get("/films/:id", (req, res) => {
  const sql = `
    SELECT 
      ID, name, description, classify, format, director, actor, type, 
      DATE_FORMAT(start_day, '%d/%m/%Y') AS start_day, 
      duration, link
    FROM film
    WHERE ID = ?
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Lỗi truy vấn phim:", err);
      res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: "Không tìm thấy phim" });
      return;
    }
    res.json(result[0]);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Backend chạy tại http://localhost:5000");
});
