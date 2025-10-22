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

app.get("/api/profile/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT * FROM profile WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(result[0]);
  });
});

app.put("/api/profile/:id", (req, res) => {
  const { id } = req.params;
  const { name, gender, email, password, phone, birthday } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  const sql = `
    UPDATE profile 
    SET name = ?, gender = ?, email = ?, password = ?, phone = ?, birthday = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, gender, email, password, phone, birthday, id],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi khi cập nhật profile:", err);
        return res.status(500).json({ message: "Lỗi server" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.status(200).json({ message: "Cập nhật thông tin thành công" });
    }
  );
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
  const { userId, paymentMethod, pickupDate, paymentDay, items } = req.body;
  if (!userId || !paymentMethod || !pickupDate || !items?.length)
    return res.status(400).json({ error: "Thiếu dữ liệu thanh toán" });

  // 1️⃣ Tạo bản ghi hóa đơn (goods_bill)
  const sqlBill = `
    INSERT INTO goods_bill (user_id, payment_day, payment_method, receive_day)
    VALUES (?, ?, ?, ?)
  `;
  db.query(
    sqlBill,
    [userId, paymentDay, paymentMethod, pickupDate],
    (err, result) => {
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
          return res
            .status(500)
            .json({ error: "Lỗi khi lưu chi tiết hóa đơn" });
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
    }
  );
});

// Lấy danh sách ghế theo phòng, ngày và giờ
app.get("/slots", (req, res) => {
  const { room_id, day, time } = req.query;
  if (!room_id || !day || !time) {
    return res.status(400).json({ error: "Thiếu room_id, day hoặc time" });
  }

  const sql = `
    SELECT ID, room_id, line, col, status, day, time, user_id 
    FROM slot 
    WHERE room_id = ? AND day = ? AND time = ?
  `;
  db.query(sql, [room_id, day, time], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi truy vấn slot:", err);
      return res.status(500).json({ error: "Lỗi truy vấn slot" });
    }
    res.json(result);
  });
});

// Giữ ghế tạm thời (reserved)
app.post("/slot", (req, res) => {
  console.log("📩 Nhận request giữ ghế:", req.body);
  const { room_id, line, col, day, time, user_id } = req.body;
  if (!room_id || !line || !col || !day || !time || !user_id) {
    return res.status(400).json({ error: "Thiếu dữ liệu giữ ghế" });
  }

  const sql = `
    INSERT INTO slot (room_id, line, col, status, day, time, user_id)
    VALUES (?, ?, ?, 'reserved', ?, ?, ?)
  `;
  db.query(sql, [room_id, line, col, day, time, user_id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi giữ ghế:", err);
      return res.status(500).json({ error: "Lỗi giữ ghế" });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// Xóa tất cả ghế reserved của người dùng (hết 5 phút hoặc hủy)
app.post("/clear_reserved", (req, res) => {
  const { user_id, day, time } = req.body;
  if (!user_id || !day || !time) {
    return res.status(400).json({ error: "Thiếu dữ liệu xóa ghế reserved" });
  }

  const sql = `
    DELETE FROM slot 
    WHERE user_id = ? AND day = ? AND time = ? AND status = 'reserved'
  `;
  db.query(sql, [user_id, day, time], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi xóa ghế reserved:", err);
      return res.status(500).json({ error: "Lỗi khi xóa ghế reserved" });
    }
    res.json({ success: true, deleted: result.affectedRows });
  });
});

app.post("/complete-bookticket", (req, res) => {
  const {
    user_id,
    film_id,
    selectedSeats,
    selectedRoom,
    selectedDate,
    selectedTime,
    paymentMethod,
    goods,
  } = req.body;

  // Chuyển ngày dd/mm/yyyy → yyyy-mm-dd để phù hợp với MySQL
  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };
  const formattedDate = formatDate(selectedDate);

  // 🔹 1. Thêm dòng mới vào ticket_bill
  const sqlInsertTicket =
    "INSERT INTO ticket_bill (film_id, payment_day, payment_method) VALUES (?, NOW(), ?)";

  db.query(sqlInsertTicket, [film_id, paymentMethod], (err, ticketResult) => {
    if (err) {
      console.error("❌ Lỗi khi thêm ticket_bill:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    const ticket_id = ticketResult.insertId;
    console.log("✅ Đã tạo ticket_id:", ticket_id);

    // 🔹 2. Update trạng thái ghế: reserved → booked
    let updatesDone = 0;
    let totalToUpdate = 0;

    // Đếm tổng ghế "reserved" trong ma trận
    selectedSeats.forEach((row) => {
      row.forEach((seat) => {
        if (seat === "reserved") totalToUpdate++;
      });
    });

    if (totalToUpdate === 0) {
      console.warn("⚠️ Không có ghế reserved để update!");
      return res.json({ success: true, ticket_id });
    }

    selectedSeats.forEach((row, lineIndex) => {
      row.forEach((seat, colIndex) => {
        if (seat === "reserved") {
          const sqlUpdateSeat = `
            UPDATE slot 
            SET status='booked', ticket_id=? 
            WHERE room_id=? AND line=? AND col=? AND day=? AND time=? 
            AND status='reserved' AND user_id=?`;

          db.query(
            sqlUpdateSeat,
            [
              ticket_id,
              selectedRoom,
              lineIndex + 1, // vì line trong DB bắt đầu từ 1
              colIndex + 1,
              formattedDate,
              selectedTime,
              user_id,
            ],
            (err, result) => {
              if (err) {
                console.error("❌ Lỗi khi cập nhật ghế:", err);
                return res
                  .status(500)
                  .json({ success: false, message: err.message });
              }

              updatesDone++;
              if (updatesDone === totalToUpdate) {
                // 🔹 3. Nếu có goods, insert vào goods_bill_detail
                if (goods && goods.length > 0) {
                  const goodsToInsert = goods
                    .filter((g) => g.quantity > 0)
                    .map((g) => [g.goods_id, g.quantity, ticket_id]);

                  if (goodsToInsert.length > 0) {
                    db.query(
                      "INSERT INTO goods_bill_detail (goods_id, quantity, ticket_id) VALUES ?",
                      [goodsToInsert],
                      (err) => {
                        if (err) {
                          console.error(
                            "❌ Lỗi khi thêm goods_bill_detail:",
                            err
                          );
                          return res
                            .status(500)
                            .json({ success: false, message: err.message });
                        }
                        console.log("✅ Đã thêm goods_bill_detail");
                        res.json({ success: true, ticket_id });
                      }
                    );
                  } else {
                    res.json({ success: true, ticket_id });
                  }
                } else {
                  res.json({ success: true, ticket_id });
                }
              }
            }
          );
        }
      });
    });
  });
});

app.get("/user-transactions/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  // 1️⃣ Lấy giao dịch "Mua đồ ăn"
  const sqlGoods = `
    SELECT gb.ID AS bill_id, gb.payment_day,
           COALESCE(SUM(g.discount * gbd.quantity), 0) AS total
    FROM goods_bill gb
    JOIN goods_bill_detail gbd ON gb.ID = gbd.bill_id
    JOIN goods g ON gbd.goods_id = g.ID
    WHERE gb.user_id = ?
    GROUP BY gb.ID
    ORDER BY gb.payment_day DESC
  `;

  db.query(sqlGoods, [user_id], (err, goodsResults) => {
    if (err) {
      console.error("❌ Lỗi khi truy vấn goods_bill:", err);
      return res.status(500).json({ error: "Lỗi truy vấn goods_bill" });
    }

    // 2️⃣ Lấy tất cả ticket_id của user (dù có hoặc không có goods)
    const sqlTickets = `
      SELECT DISTINCT tb.ID AS ticket_id, tb.payment_day
      FROM ticket_bill tb
      JOIN slot s ON s.ticket_id = tb.ID
      WHERE s.user_id = ?
      ORDER BY tb.payment_day DESC
    `;

    db.query(sqlTickets, [user_id], (err2, tickets) => {
      if (err2) {
        console.error("❌ Lỗi khi truy vấn ticket_bill:", err2);
        return res.status(500).json({ error: "Lỗi truy vấn ticket_bill" });
      }

      if (tickets.length === 0) {
        const transactions = goodsResults.map((item, idx) => ({
          id: `G-${item.bill_id}`,
          stt: idx + 1,
          type: "Mua đồ ăn",
          date: item.payment_day,
          total: Number(item.total),
        }));
        return res.json(transactions);
      }

      const ticketIds = tickets.map((t) => t.ticket_id);

      // 3️⃣ Tính số ghế cho từng ticket
      const sqlSeat = `
        SELECT ticket_id, COUNT(*) AS seat_count
        FROM slot
        WHERE ticket_id IN (?)
        GROUP BY ticket_id
      `;

      db.query(sqlSeat, [ticketIds], (err3, seatResults) => {
        if (err3) {
          console.error("❌ Lỗi khi truy vấn slot:", err3);
          return res.status(500).json({ error: "Lỗi truy vấn slot" });
        }

        // 4️⃣ Tính tiền đồ ăn đi kèm (nếu có)
        const sqlGoodsTicket = `
          SELECT gbd.ticket_id, COALESCE(SUM(g.discount * gbd.quantity), 0) AS goods_total
          FROM goods_bill_detail gbd
          JOIN goods g ON gbd.goods_id = g.ID
          WHERE gbd.ticket_id IN (?)
          GROUP BY gbd.ticket_id
        `;

        db.query(sqlGoodsTicket, [ticketIds], (err4, goodsTicketResults) => {
          if (err4) {
            console.error("❌ Lỗi khi truy vấn goods_bill_detail:", err4);
            return res
              .status(500)
              .json({ error: "Lỗi truy vấn goods_bill_detail" });
          }

          const seatMap = {};
          seatResults.forEach(
            (r) => (seatMap[r.ticket_id] = Number(r.seat_count || 0))
          );

          const goodsMap = {};
          goodsTicketResults.forEach(
            (r) => (goodsMap[r.ticket_id] = Number(r.goods_total || 0))
          );

          // 5️⃣ Gộp toàn bộ giao dịch lại
          const transactions = [];

          // Thêm "Mua đồ ăn" độc lập
          goodsResults.forEach((g) => {
            transactions.push({
              id: `G-${g.bill_id}`,
              type: "Mua đồ ăn",
              date: g.payment_day,
              total: Number(g.total),
            });
          });

          // Thêm "Mua vé" và "Mua vé (có đồ ăn)"
          tickets.forEach((t) => {
            const seatCount = seatMap[t.ticket_id] || 0;
            const seatTotal = seatCount * 50000;
            const goodsTotal = goodsMap[t.ticket_id] || 0;
            const total = seatTotal + goodsTotal;

            const type = goodsTotal > 0 ? "Mua vé (có đồ ăn đi kèm)" : "Mua vé";

            transactions.push({
              id: `T-${t.ticket_id}`,
              type,
              date: t.payment_day,
              total,
            });
          });

          // 6️⃣ Sắp xếp theo ngày (mới nhất trước)
          transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

          // 7️⃣ Đánh số thứ tự
          transactions.forEach((t, i) => (t.stt = i + 1));

          res.json(transactions);
        });
      });
    });
  });
});

// HUỶ GIAO DỊCH MUA ĐỒ ĂN
app.delete("/cancel-goods/:bill_id", (req, res) => {
  const bill_id = req.params.bill_id;

  // Xoá chi tiết hoá đơn trước
  const sqlDeleteDetail = "DELETE FROM goods_bill_detail WHERE bill_id = ?";
  db.query(sqlDeleteDetail, [bill_id], (err1) => {
    if (err1) {
      console.error("❌ Lỗi khi xoá goods_bill_detail:", err1);
      return res.status(500).json({ error: "Lỗi khi xoá chi tiết hoá đơn" });
    }

    // Sau đó xoá hoá đơn chính
    const sqlDeleteBill = "DELETE FROM goods_bill WHERE ID = ?";
    db.query(sqlDeleteBill, [bill_id], (err2, result) => {
      if (err2) {
        console.error("❌ Lỗi khi xoá goods_bill:", err2);
        return res.status(500).json({ error: "Lỗi khi xoá hoá đơn đồ ăn" });
      }

      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Không tìm thấy hoá đơn cần xoá" });

      res.json({ message: "Đã huỷ giao dịch Mua đồ ăn thành công" });
    });
  });
});

// HUỶ GIAO DỊCH MUA VÉ
app.delete("/cancel-ticket/:ticket_id", (req, res) => {
  const ticket_id = req.params.ticket_id;

  const sqlDeleteTicket = "DELETE FROM ticket_bill WHERE ID = ?";
  db.query(sqlDeleteTicket, [ticket_id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi xoá ticket_bill:", err);
      return res.status(500).json({ error: "Lỗi khi xoá hoá đơn vé" });
    }

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy vé cần xoá" });

    res.json({ message: "Đã huỷ giao dịch Mua vé thành công" });
  });
});

// HUỶ GIAO DỊCH MUA VÉ (CÓ ĐỒ ĂN ĐI KÈM)
app.delete("/cancel-ticket-with-goods/:ticket_id", (req, res) => {
  const ticket_id = req.params.ticket_id;

  // 1️⃣ Xoá chi tiết đồ ăn liên quan
  const sqlDeleteGoodsDetail =
    "DELETE FROM goods_bill_detail WHERE ticket_id = ?";
  db.query(sqlDeleteGoodsDetail, [ticket_id], (err1) => {
    if (err1) {
      console.error("❌ Lỗi khi xoá goods_bill_detail:", err1);
      return res
        .status(500)
        .json({ error: "Lỗi khi xoá chi tiết đồ ăn đi kèm vé" });
    }

    // 2️⃣ Xoá hoá đơn vé
    const sqlDeleteTicket = "DELETE FROM ticket_bill WHERE ID = ?";
    db.query(sqlDeleteTicket, [ticket_id], (err2, result) => {
      if (err2) {
        console.error("❌ Lỗi khi xoá ticket_bill:", err2);
        return res.status(500).json({ error: "Lỗi khi xoá vé" });
      }

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Không tìm thấy vé cần xoá" });

      res.json({
        message: "Đã huỷ giao dịch Mua vé (có đồ ăn đi kèm) thành công",
      });
    });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Backend chạy tại http://localhost:5000");
});
