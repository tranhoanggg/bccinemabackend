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
        return res.status(500).send("Lỗi khi lấy dữ liệu goods");
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
    // dùng db.promise().query thay vì db.query
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

app.get("/combo/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT ID, name, detail FROM combo WHERE ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Không tìm thấy combo" });
    res.json(results[0]);
  });
});

// Lấy toàn bộ cart theo user_id
app.get("/cart/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const query = "SELECT * FROM cart WHERE user_id = ?";
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn giỏ hàng:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    res.json(results);
  });
});

// Thêm hoặc cập nhật sản phẩm trong giỏ hàng
app.post("/cart/add", (req, res) => {
  const { user_id, goods_id } = req.body;

  if (!user_id || !goods_id)
    return res.status(400).json({ error: "Thiếu user_id hoặc goods_id" });

  // Kiểm tra xem sản phẩm đã có trong giỏ chưa
  const checkQuery = "SELECT * FROM cart WHERE user_id = ? AND goods_id = ?";
  db.query(checkQuery, [user_id, goods_id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn kiểm tra:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }

    if (results.length > 0) {
      // Đã có sản phẩm -> tăng quantity thêm 1
      const updateQuery =
        "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND goods_id = ?";
      db.query(updateQuery, [user_id, goods_id], (err2) => {
        if (err2) {
          console.error("Lỗi cập nhật giỏ hàng:", err2);
          return res.status(500).json({ error: "Lỗi cập nhật" });
        }
        res.json({ message: "Đã cập nhật số lượng" });
      });
    } else {
      // Chưa có -> thêm mới
      const insertQuery =
        "INSERT INTO cart (user_id, goods_id, quantity) VALUES (?, ?, 1)";
      db.query(insertQuery, [user_id, goods_id], (err3) => {
        if (err3) {
          console.error("Lỗi thêm sản phẩm:", err3);
          return res.status(500).json({ error: "Lỗi thêm sản phẩm" });
        }
        res.json({ message: "Đã thêm sản phẩm vào giỏ hàng" });
      });
    }
  });
});

app.get("/goods_in_cart", (req, res) => {
  const idsParam = req.query.ids;
  if (!idsParam) return res.status(400).json({ error: "Thiếu tham số ids" });

  const ids = idsParam
    .split(",")
    .map((id) => parseInt(id))
    .filter(Boolean);
  if (ids.length === 0)
    return res.status(400).json({ error: "Danh sách ids trống" });

  const sql = "SELECT * FROM goods WHERE ID IN (?)";
  db.query(sql, [ids], (err, rows) => {
    if (err) {
      console.error("Lỗi truy vấn goods_in_cart:", err);
      return res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
    }
    res.json(rows);
  });
});

// PUT cập nhật số lượng
app.put("/cart", (req, res) => {
  const { userId, goodsId, quantity } = req.body;
  const sql = "UPDATE cart SET quantity = ? WHERE user_id = ? AND goods_id = ?";
  db.query(sql, [quantity, userId, goodsId], (err) => {
    if (err) return res.status(500).json({ error: "Lỗi cập nhật số lượng" });
    res.json({ success: true });
  });
});

// DELETE xoá sản phẩm khỏi giỏ
app.delete("/cart", (req, res) => {
  const { userId, goodsId } = req.query;
  const sql = "DELETE FROM cart WHERE user_id = ? AND goods_id = ?";
  db.query(sql, [userId, goodsId], (err) => {
    if (err) return res.status(500).json({ error: "Lỗi xoá sản phẩm" });
    res.json({ success: true });
  });
});

app.post("/complete_payment", (req, res) => {
  const { userId, paymentMethod, paymentDay, items } = req.body;
  if (!userId || !paymentMethod || !items?.length)
    return res.status(400).json({ error: "Thiếu dữ liệu thanh toán" });

  // 1️⃣ Tạo bản ghi hóa đơn (goods_bill)
  const sqlBill = `
    INSERT INTO goods_bill (user_id, payment_day, payment_method)
    VALUES (?, ?, ?)
  `;
  db.query(sqlBill, [userId, paymentDay, paymentMethod], (err, result) => {
    if (err) {
      console.error("Lỗi khi tạo bill:", err);
      return res.status(500).json({ error: "Lỗi khi tạo hóa đơn" });
    }

    const billId = result.insertId;

    // 2️⃣ Tạo chi tiết hóa đơn (goods_bill_detail)
    const detailValues = items.map((i) => [i.goodsId, i.quantity, billId]);
    const sqlDetail = `
      INSERT INTO goods_bill_detail (goods_id, quantity, bill_id)
      VALUES ?
    `;
    db.query(sqlDetail, [detailValues], (err2) => {
      if (err2) {
        console.error("Lỗi khi lưu chi tiết hóa đơn:", err2);
        return res.status(500).json({ error: "Lỗi khi lưu chi tiết hóa đơn" });
      }

      // 3️⃣ Xóa sản phẩm khỏi giỏ hàng
      const goodsIds = items.map((i) => i.goodsId);
      const sqlDeleteCart = `
        DELETE FROM cart
        WHERE user_id = ? AND goods_id IN (?)
      `;
      db.query(sqlDeleteCart, [userId, goodsIds], (err3) => {
        if (err3) {
          console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", err3);
          return res
            .status(500)
            .json({ error: "Lỗi khi xóa sản phẩm trong giỏ hàng" });
        }

        res.json({
          success: true,
          message: "Thanh toán hoàn tất!",
          billId,
        });
      });
    });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Backend chạy tại http://localhost:5000");
});
