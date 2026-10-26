# Digital Memory Vault (`DIGITAL_MEMORY_VAULT`)

**Course Name:** Advanced Database Management Systems Lab (`CSE 468`)  
**Submitted To:** Nabid Nur Hasan Sabby, Lecturer, Department of CSE, FSET, USTC  
**Submitted By:** Zahid Al Noor Himanta (`Roll: 23070152`)

---

## 1. Project Overview
**Digital Memory Vault** is a 3NF/BCNF-normalized relational database and full-stack web application built to store, link, and reconstruct personal memories across 10 interconnected MySQL tables (`USER`, `MEMORY`, `PERSON`, `LOCATION`, `EMOTION`, `TAG`, `MEDIA`, `MEMORY_VERSION`, `MEMORY_PERSON`, and `MEMORY_TAG`).

### Key ADBMS Features Implemented (Weeks 3 – 7)
- **Strict SHA-256 Authentication & Row-Level Data Isolation (`Week_7.sql`)**: Passwords are hashed via `SHA2(password, 256)`. User A (`himanta@gmail.com`) and User B (`fat_ovi@gmail.com`) are strictly isolated via `WHERE user_id = ?` and cannot access each other's vaults.
- **Automatic Version History via Triggers (`Week_5.sql`)**: `trg_memory_before_update` automatically archives `OLD.title`, `OLD.description`, and `OLD.memory_date` into `MEMORY_VERSION` before any `UPDATE` on `MEMORY`.
- **Stored Procedures & Views (`Week_5.sql`)**: Includes `sp_create_memory`, `sp_day_reconstruction`, and `VIEW active_memory_overview`.
- **6-Table Multi-Condition Search, "On This Day", & SQL Analytics (`Week_6.sql`)**: Dynamic filtering across Person, Location, Date Range, Emotion, and Tag; `GROUP BY` analytics charts; and atomic `START TRANSACTION ... COMMIT` execution.
- **Image Uploads (`MEDIA` Table)**: Supports multi-photo uploads per memory (`1:N` relationship) storing `file_path` references with `ON DELETE CASCADE` integrity.
- **Role-Based Permissions & Indexing (`Week_7.sql`)**: Simulates `app_user@localhost` vs `report_user@localhost` (`ERROR 1142` permission guards), `EXPLAIN` query plans with `idx_memory_date`, and automated Test Cases `T1`–`T8`.

---

## 2. How to Upload to GitHub & Create a Live Link (Netlify / Vercel)

1. **Extract this ZIP archive** and push all files to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Complete CSE 468 Digital Memory Vault ADBMS Project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/digital-memory-vault.git
   git push -u origin main
   ```
2. **Deploy Live in 1 Click**:
   - **Netlify**: Log into [Netlify](https://app.netlify.com/), click **Add new site -> Import an existing project**, select your GitHub repo, and click **Deploy**. (`netlify.toml` is already configured).
   - **Vercel**: Log into [Vercel](https://vercel.com/), click **Add New Project**, import your GitHub repo, and click **Deploy**. (`vercel.json` is already configured).

---

## 3. How to Run Locally (Frontend + MySQL Workbench + Optional FastAPI Backend)

### Step A: Run the Frontend Webapp
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
- **Demo Account 1:** `himanta@gmail.com` / `HIMANTA_pass_123`
- **Demo Account 2:** `fat_ovi@gmail.com` / `OVI_pass_123`

### Step B: Set Up MySQL Workbench
Open `sql/00_FULL_DATABASE_SETUP.sql` (or run `Week_3.sql` through `Week_7.sql` in order) inside MySQL Workbench to create `DIGITAL_MEMORY_VAULT`.

### Step C: (Optional) Run the FastAPI + MySQL Backend for Physical Disk Image Uploads
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
