# MemoryVault — Private Personal Archive & Timeline

**MemoryVault** is a full-stack personal memory archiving application designed to organize life events, photos, people, places, emotions, and tags into a structured, searchable timeline with automatic revision history.

---

## Key Features

- **End-to-End Isolated User Vaults**: Secure account registration and SHA-256 authentication where every user's timeline, connections, locations, and media are strictly isolated.
- **Multi-Dimensional Search & Filtering**: Filter memories simultaneously across people, locations, emotions, custom tags, full-text keywords, and date ranges.
- **Automatic Revision History**: Trigger-driven versioning automatically captures a snapshot of a memory's previous state before any edit is applied, allowing one-click restoration.
- **Chronological Day Reconstruction**: Select any calendar date to reconstruct a time-ordered walkthrough of events from that day.
- **"On This Day" Rediscovery**: Automatically surfaces memories recorded on the same month and day in previous years.
- **Visual Insights & Analytics**: Interactive charts summarizing your most frequent connections, top locations, tag distribution, and annual memory counts.
- **Safe Deletion Lifecycle**: Soft-delete memories to the Trash bin with full restore support or permanent cascading deletion.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Database Architecture**: MySQL 8.0 (10 normalized 3NF/BCNF tables, triggers, stored procedures, views, composite indexes, and atomic transactions)
- **Backend API**: FastAPI (Python) + `mysql-connector-python`

---

## Getting Started Locally

### 1. Run the Web Application
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Initialize the MySQL Database (Optional Backend Mode)
Run `sql/schema_and_procedures.sql` in MySQL Workbench or via CLI:
```bash
mysql -u root -p < sql/schema_and_procedures.sql
```

### 3. Start the FastAPI Server (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
