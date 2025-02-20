require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3000;

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// 中间件
app.use(bodyParser.json());
app.use(express.static('public'));

// 获取书籍列表
app.get('/books', async (req, res) => {
  try {
  const [results] = await pool.query(`
    SELECT 
      id, 
      title, 
      author, 
      CAST(price AS DECIMAL(10,2)) AS price  -- 强制转换为数值
    FROM books
  `);
    res.json(results);
  } catch (err) {
    console.error('查询失败:', err);
    res.status(500).send('服务器错误');
  }
});

// 添加书籍（测试模式使用明文密码）
app.post('/add-book', async (req, res) => {
  const { title, author, price, password } = req.body;
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).send('密码错误');
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO books (title, author, price) 
       VALUES (?, ?, ?)`,
      [title, author, price]
    );
    res.send(`添加成功，ID: ${result.insertId}`);
  } catch (err) {
    console.error('添加失败:', err);
    res.status(500).send('添加失败');
  }
});

// 购买书籍（带事务处理）
app.post('/buy-book', async (req, res) => {
  const { bookId, contact, pickupTime } = req.body;
  const conn = await pool.getConnection();
  
  console.log('开始购买事务'); // 添加日志
  try {
    await conn.beginTransaction();
    
    // 插入购买记录
    const [insertResult] = await conn.query(
      'INSERT INTO buyers (book_id, contact, pickup_time) VALUES (?, ?, ?)',
      [bookId, contact, pickupTime]
    );
    console.log('插入记录:', insertResult); // 打印插入结果
    
    // 删除书籍
    const [deleteResult] = await conn.query(
      'DELETE FROM books WHERE id = ?',
      [bookId]
    );
    console.log('删除记录:', deleteResult); // 打印删除结果
    
    await conn.commit();
    res.send('购买成功');
  } catch (err) {
    console.error('事务失败:', err);
    await conn.rollback();
    res.status(500).send('购买失败');
  } finally {
    conn.release();
  }
});


app.delete('/delete-code/book', async (req, res) => {
  const { id, password } = req.body;

  // 添加密码校验（测试环境使用明文）
  if (password !== process.env.ADMIN_PASSWORD) {
    console.log('密码错误');
    throw new Error('密码错误');
  }

  try {
    // 查询书籍是否存在
    const [book] = await pool.query('SELECT id FROM books WHERE id = ?', [id]);
    if (!book) {
      console.log('书籍不存在');
      throw new Error('书籍不存在');
    }

    // 执行删除
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    console.log('删除记录数:', result.affectedRows);

    res.json({ success: true });
  } catch (err) {
    console.error('删除失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// 启动服务器
app.listen(port, () => {
  console.log(`服务运行中: http://localhost:${port}`);
});