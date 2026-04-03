# BettingGame - Rummy & Teen Patti Multiplayer Games

## 📋 Overview
This project contains **two multiplayer card games** built with **Node.js (Express/Socket.io)** backend and **React** frontend:
- **13-Card Indian Rummy** - Classic rummy with melds and declarations
- **Teen Patti** - 3-card poker with blind/seen mechanics

---

## 🎮 Game Rules

### **Rummy (13-Card Indian Rummy)**
**Objective:** Arrange all 13 cards into valid melds and declare first.

**Melds:**
- **Pure Sequence:** 3+ cards of same suit in order (e.g., 5♥ 6♥ 7♥)
- **Set:** 3-4 cards of same rank, different suits (e.g., K♠ K♥ K♦)
- **Impure Sequence:** Sequence with printed joker (1 per sequence allowed)

**Rules:**
- Need **at least 2 sequences** to declare
- At least **1 pure sequence** required
- Declare when your hand forms valid melds
- **Drop penalty:** First drop = 20 pts, middle drop = 40 pts
- **Max losers' score:** 80 points
- **Max players:** 6 per table

### **Teen Patti (3-Card Poker)**
**Objective:** Have the best 3-card hand or bluff opponents into folding.

**Hand Rankings (Best to Worst):**
1. **Trail/Three of a Kind:** AAA
2. **Pure Sequence:** 5♥ 6♥ 7♥ (same suit, consecutive)
3. **Sequence:** 5♠ 6♥ 7♦ (consecutive, any suit)
4. **Color/Flush:** 2♥ 4♥ 10♥ (same suit)
5. **Pair:** 5♠ 5♥ K♦
6. **High Card:** Any other hand

**Rules:**
- All players start blind (can't see cards)
- **Boot Amount:** Minimum bet required from each player
- **See:** Pay boot amount to see your cards
- **Blind Chaal:** Bet blindly = boot amount
- **Seen Chaal:** Bet after seeing = 2x boot amount
- **Show:** Challenge comparison (costs 2x boot)
- **Fold:** Quit current hand
- **Max players:** 6 per table

---

## 🚀 Setup & Installation

### **Backend Setup**

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** with database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=betting_game
   JWT_SECRET=your_secret_key
   FRONTEND_URL_MAIN=http://localhost:5173
   FRONTEND_URL_PAYMENT=http://localhost:5174
   BACKEND_URL_PAYMENT=http://localhost:5000
   ```

4. **Setup game tables** (creates required database schema):
   ```bash
   npm run setup
   ```

5. **Start the server:**
   ```bash
   npm run dev    # Development with auto-reload
   npm start      # Production mode
   ```

### **Frontend Setup**

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Rummy: `http://localhost:5173/rummy`
   - Teen Patti: `http://localhost:5173/teenpatti`

---

## 📊 Database Tables

### **rummy_games**
```sql
- id (INT, Primary Key)
- room_id (VARCHAR, Unique) - Game room identifier
- winner_id (INT, Foreign Key) - User ID of winner
- prize_coins (INT) - Prize won
- players_json (JSON) - Serialized player data
- created_at (TIMESTAMP)
```

### **teen_patti_games**
```sql
- id (INT, Primary Key)
- room_id (VARCHAR, Unique) - Game room identifier
- winner_id (INT, Foreign Key) - User ID of winner
- pot_amount (INT) - Total pot
- hand_type (VARCHAR) - Winner's hand type (Trail, Pure Sequence, etc.)
- players_json (JSON) - Serialized player data
- created_at (TIMESTAMP)
```

### **transactions** (existing)
Automatically records wins:
```sql
INSERT INTO transactions (id, user_id, coins, status, type, game)
VALUES (uuid, winner_id, prize_amount, 'success', 'profit', 'rummy|teen_patti')
```

---

## 🔧 Architecture

### **Backend (Node.js/Express + Socket.io)**
```
server/
├── game/
│   ├── rummy.js           ← Rummy game engine & socket events
│   ├── teenPatti.js       ← Teen Patti game engine & socket events
│   └── cards.js           ← Shared card logic & validation
├── config/
│   └── db.js              ← MySQL connection pool
├── scripts/
│   └── setupGameTables.js ← Database initialization
└── server.js              ← Express app & Socket.io setup
```

### **Frontend (React)**
```
client/src/components/
├── Rummy.jsx              ← Rummy UI component
├── Teenpatti.jsx          ← Teen Patti UI component
└── ...other components
```

### **Socket.io Events**

#### **Rummy Events**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `rm:create` | Client→Server | Create new rummy room |
| `rm:join` | Client→Server | Join existing room |
| `rm:start` | Client→Server | Start game (host only) |
| `rm:drawdeck` | Client→Server | Draw from deck |
| `rm:drawdiscard` | Client→Server | Draw from discard pile |
| `rm:discard` | Client→Server | Discard a card |
| `rm:declare` | Client→Server | Declare melds & win |
| `rm:drop` | Client→Server | Fold with penalty |
| `rm:state` | Server→Client | Broadcast game state |
| `rm:gameover` | Server→Client | Game ended, show winner |

#### **Teen Patti Events**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `tp:create` | Client→Server | Create new teen patti table |
| `tp:join` | Client→Server | Join table |
| `tp:start` | Client→Server | Start new round |
| `tp:see` | Client→Server | See your cards |
| `tp:chaal` | Client→Server | Bet/call |
| `tp:fold` | Client→Server | Fold hand |
| `tp:show` | Client→Server | Challenge showdown |
| `tp:state` | Server→Client | Broadcast table state |
| `tp:gameover` | Server→Client | Round ended, show winner |

---

## 🎯 Key Features Fixed

✅ **Rummy Game Logic**
- Proper meld validation (pure sequences, sets, impure sequences)
- Joker rank picking and deadwood calculation
- Drop penalties (20/40 points)
- Declaration validation
- Complete room management

✅ **Teen Patti Game Logic**
- Hand evaluation & comparison
- Blind/Seen betting mechanics
- Showdown winner determination
- Boot amount management
- All hand rankings implemented

✅ **Frontend**
- Real-time game state updates
- Socket.io event handling with proper cleanup
- Beautiful game UI with Tailwind CSS
- Activity logging
- Proper dependency arrays in hooks

✅ **Backend**
- Database transaction recording
- Game history storage (JSON serialization)
- Room cleanup on disconnect
- Proper error handling
- Winner payout system

✅ **Database**
- Automatic table creation via setup script
- Transaction recording for all wins
- Game history for analytics
- Proper indexing for performance

---

## 🐛 Known Issues & Solutions

### **Issue: "Room not found"**
- **Cause:** Socket not properly connected or room doesn't exist
- **Solution:** Ensure server is running and socket.io is properly initialized

### **Issue: Cards not displaying**
- **Cause:** Card data not being sent from server
- **Solution:** Check game state is being broadcast properly

### **Issue: Database errors**
- **Cause:** Tables don't exist or schema mismatch
- **Solution:** Run `npm run setup` in the server directory

### **Issue: Slow performance**
- **Cause:** Too many room broadcasts
- **Solution:** Consider pagination or filtering room lists

---

## 📝 Testing the Games

### **Test Rummy:**
1. Open client in two browser windows
2. Create a Rummy room with entry coins
3. Join with second window
4. Click "START GAME"
5. Take turns drawing and discarding
6. Click "DECLARE" when ready to win

### **Test Teen Patti:**
1. Open client in 2-3 browser windows
2. Create a Teen Patti table with boot amount
3. Join with other windows
4. Click "START GAME"
5. Use "SEE CARDS"/"CHAAL"/"FOLD"/"SHOW" buttons
6. Play until someone wins

---

## 🔐 Security Notes
- ✅ WhiteList CORS origins
- ✅ JWT token verification on checkuser
- ✅ Database queries use parameterized statements (mysql2)
- ⚠️ TODO: Add bet limit validations
- ⚠️ TODO: Prevent max bet overflow attacks

---

## 📈 Future Improvements
1. Add bot players for testing
2. Implement game statistics & leaderboards
3. Add daily bonuses & promotions
4. Tournament mode (bracket)
5. Spectator mode for live games
6. Chat messages in game rooms
7. Replay functionality
8. Mobile app version

---

## 📞 Support
For issues or questions, check:
- Server logs for socket errors
- Browser console for frontend errors
- Database logs for query issues
- Ensure all environment variables are set correctly

**Last Updated:** April 1, 2026
