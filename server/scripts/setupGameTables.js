import pool from '../config/db.js';

const setupGameTables = async () => {
  try {
    console.log('Setting up game tables...');

    // Create rummy_games table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rummy_games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id VARCHAR(255) UNIQUE NOT NULL,
        winner_id INT NOT NULL,
        prize_coins INT DEFAULT 0,
        players_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_winner_id (winner_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ rummy_games table created');

    // Create teen_patti_games table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teen_patti_games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id VARCHAR(255) UNIQUE NOT NULL,
        winner_id INT NOT NULL,
        pot_amount INT DEFAULT 0,
        hand_type VARCHAR(50),
        players_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_winner_id (winner_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ teen_patti_games table created');

    // Verify transactions table has required columns
    await pool.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS game VARCHAR(50),
      ADD COLUMN IF NOT EXISTS type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'success',
      ADD INDEX IF NOT EXISTS idx_game (game),
      ADD INDEX IF NOT EXISTS idx_type (type)
    `);
    console.log('✓ transactions table updated');

    console.log('✅ All game tables setup successfully!');
  } catch (error) {
    console.error('❌ Error setting up game tables:', error.message);
    process.exit(1);
  }
};

setupGameTables();
