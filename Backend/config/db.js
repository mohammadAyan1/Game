import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30' // ✅ IST FIX
});

// DB init
(async () => {
  try {
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        account_name VARCHAR(255),
        upi_id VARCHAR(255) UNIQUE,
        bank_name VARCHAR(255),
        account_no VARCHAR(255),
        ifsc_code VARCHAR(50),
        branch VARCHAR(255),
        is_active TINYINT DEFAULT 1,
        daily_limit INT DEFAULT 100000,
        collected INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(255),
        amount INT,
        coins INT,
        bank_id INT,
        status ENUM('pending','success','expired') DEFAULT 'pending',
        utr_number VARCHAR(255),
        return_url TEXT,
        expires_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        FOREIGN KEY (bank_id) REFERENCES bank_accounts(id)
      )
    `);

    connection.release();
    console.log("✅ Database Ready");

  } catch (err) {
    console.error("DB Error:", err);
  }
})();

export default pool;