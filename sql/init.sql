-- 删除旧数据库（仅限测试环境）
DROP DATABASE IF EXISTS bookstore;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS bookstore;
USE bookstore;

-- 书籍表
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- 购买记录表
CREATE TABLE buyers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  contact VARCHAR(255) NOT NULL,
  pickup_time DATETIME NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 初始测试数据
INSERT INTO books (title, author, price) VALUES
('JavaScript高级程序设计', 'Nicholas C. Zakas', 75.00),
('Python编程：从入门到实践', 'Eric Matthes', 89.90),
('深入浅出Node.js', '朴灵', 68.50);
SELECT * FROM buyers;