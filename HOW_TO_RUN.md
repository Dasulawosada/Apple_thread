# 🧵 Apple Thread — Complete Project Guide & Run Instructions
*(Sinhala & English Instructions)*

මෙම Project එක දැන් Frontend (React + Vite) සහ Backend (Node.js Express + SQLite Database) යන දෙකෙන්ම සමන්විත සැබෑ **Full-Stack E-Commerce System** එකකි.

---

## ⚡ How to Run the Project (ප්‍රොජෙක්ට් එක Run කරගන්නේ කෙසේද?)

### Step 1: Open Terminal in `apple-thread-full` folder
VS Code එකේ `Terminal -> New Terminal` විවෘත කරන්න හෝ Command Prompt එකෙන් මෙම folder එකට යන්න:
```bash
cd "c:\Desktop\dasula\Apple_Thread_Full_Project (2)\apple-thread-full"
```

### Step 2: Run the entire project with 1 command (එක command එකකින් run කරන්න)
```bash
npm run dev
```
*(හෝ `node run-all.js`)*

මෙමගින් Backend එක (Port 5000) සහ Frontend එක (Port 5173) එකවර start වේ.

### Step 3: Open in Browser
Browser එකේ පහත link එක විවෘත කරන්න:
👉 **http://localhost:5173**

---

## 🗄️ Database Details (Database එක ක්‍රියාත්මක වන ආකාරය)

- **Database Type**: SQLite (Real Relational SQL Database)
- **Database File**: `backend/data/apple_thread.db`
- **Zero Configuration**: කිසිදු XAMPP හෝ MongoDB install කිරීමට අවශ්‍ය නැත. Project එක run වන විට ස්වයංක්‍රීයව Database එක සහ Tables හැදේ.
- **Viewing the Database**: ඔබ කැමති නම් [DB Browser for SQLite](https://sqlitebrowser.org/) හෝ VS Code හි "SQLite Viewer" extension එක භාවිතයෙන් `apple_thread.db` file එක open කර tables (Users, Products, Orders, Order Items, Reviews) බලාගත හැක.

### Database Tables:
1. **`users`**: Customer ගිණුම් සහ Admin ගිණුම් (Password bcrypt මගින් hash කර සුරක්ෂිතව තැන්පත් වේ).
2. **`products`**: නූල් වර්ග (නම, විස්තර, category, මිල, stock ප්‍රමාණය, image URL).
3. **`orders`**: Customer ඇණවුම් (නම, ලිපිනය, දුරකථන අංකය, මුළු මුදල, Order Status).
4. **`order_items`**: එක් එක් ඇණවුමට අදාළ නූල් වර්ග සහ ප්‍රමාණයන් (Quantities).
5. **`reviews`**: පාරිභෝගික rating (තරු ලකුණු) සහ අදහස් (Comments).
6. **`contacts`**: Contact Us පිටුවෙන් එවන පණිවිඩ.

---

## 🔒 Admin Panel Details (ඇඩ්මින් පැනලය)

- **Admin URL**: `http://localhost:5173/admin`
- **Default Username**: `admin` *(හෝ `admin@applethread.lk`)*
- **Default Password**: `admin123`

### Admin Features:
1. **Overview / Dashboard**: සැබෑ මුළු ආදායම (Revenue), මුළු Orders ගණන, Products ගණන, Low Stock alerts.
2. **Orders Management (`/admin/orders`)**: 
   - Customers ලා දමන orders බලාගැනීම.
   - Order Status එක `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled` ලෙස මාරු කිරීම.
3. **Products Management (`/admin/products`)**:
   - සියලුම භාණ්ඩ බැලීම, නම හෝ category එකෙන් Live Search කිරීම.
   - භාණ්ඩ Delete කිරීම.
4. **Add / Edit Product (`/admin/products/new`)**:
   - **Real Photo Upload**: පරිගණකයේ ඇති ඕනෑම JPG/PNG පින්තූරයක් තෝරා Upload කළ විට එය Server එකේ `backend/uploads/` folder එකට upload වී Database එකට link වේ.

---

## 🔍 Search Bar Feature (සෙවුම් පහසුකම)

- **Customer Search**: Header එකේ Search Bar එකේ නූල් වර්ගයේ නම (උදා: `cotton`, `silk`, `nylon`) හෝ category එකක් type කර Enter කළ විට අදාළ සියලු භාණ්ඩ පෙන්නුම් කරයි.
- **Admin Search**: Admin Products පිටුවේ search input එක මගින් අවශ්‍ය product එක ක්ෂණිකව සොයාගත හැක.

---

## 👤 Customer Accounts & Orders Flow

1. **Sign Up / Login (`/login`)**: පාරිභෝගිකයින්ට තමන්ගේම Name, Email, Password මගින් Account එකක් සාදාගත හැක.
2. **Shopping & Cart**: භාණ්ඩ Cart එකට දමා Quantity වෙනස් කළ හැක.
3. **Checkout (`/checkout`)**: Delivery Address ලබා දී ඇණවුම තහවුරු කළ විට:
   - Order එක සහ Order Items Database එකේ save වේ.
   - අදාළ භාණ්ඩ වල **Stock එක ස්වයංක්‍රීයව Database එකෙන් අඩු වේ**.
4. **Profile (`/profile`)**: තමා දැමූ ඇණවුම් වල Live Status එක (Confirmed, Shipped, Delivered) බලාගත හැක.

---

## 📁 Clean File Structure (ගොනු සැකැස්ම)

```
apple-thread-full/
├── package.json              <-- Root scripts (npm run dev)
├── run-all.js                <-- Launches backend + frontend concurrently
├── HOW_TO_RUN.md             <-- Guide
│
├── backend/                  <-- Express & SQLite Server
│   ├── server.js             <-- Main Express API entry
│   ├── db.js                 <-- SQLite schema, tables & seed data
│   ├── package.json
│   ├── .env
│   ├── data/
│   │   └── apple_thread.db   <-- Real SQL Database file
│   ├── uploads/              <-- Uploaded product images
│   ├── middleware/
│   │   ├── auth.js           <-- JWT token verification
│   │   └── upload.js         <-- Multer image upload
│   └── routes/
│       ├── authRoutes.js     <-- Login & register
│       ├── productRoutes.js  <-- Products CRUD & search
│       ├── orderRoutes.js    <-- Order creation & status
│       ├── reviewRoutes.js   <-- Reviews
│       ├── statsRoutes.js    <-- Admin dashboard stats
│       ├── uploadRoutes.js   <-- Photo uploads
│       └── contactRoutes.js  <-- Contact form
│
└── frontend/                 <-- React + Vite User Interface
    ├── src/
    │   ├── api/
    │   │   └── client.js     <-- Communicates with backend API
    │   ├── context/          <-- State managers wired to database
    │   ├── pages/            <-- Store pages, Cart, Checkout, Profile
    │   └── pages/admin/      <-- Admin Dashboard, Products, Orders, Add
```
