import os
import shutil
import hashlib
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import mysql.connector

app = FastAPI(title="Digital Memory Vault API (CSE 468 ADBMS Lab)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

def get_db_connection(role: str = "app_user"):
    user_map = {
        "app_user": ("app_user", "App@52"),
        "report_user": ("report_user", "Report@52"),
        "root": (os.getenv("MYSQL_USER", "root"), os.getenv("MYSQL_PASSWORD", ""))
    }
    db_user, db_pass = user_map.get(role, user_map["root"])
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=db_user,
        password=db_pass,
        database=os.getenv("MYSQL_DATABASE", "DIGITAL_MEMORY_VAULT")
    )

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
def login(req: LoginRequest):
    conn = get_db_connection("root")
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT user_id, name, email, created_at FROM `USER` WHERE email = %s AND password_hash = SHA2(%s, 256)",
        (req.email, req.password)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user

@app.get("/api/memories/{user_id}")
def get_user_memories(user_id: int):
    conn = get_db_connection("root")
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT m.*, l.location_name, e.emotion_name
        FROM MEMORY m
        LEFT JOIN LOCATION l ON m.location_id = l.location_id
        LEFT JOIN EMOTION e ON m.emotion_id = e.emotion_id
        WHERE m.user_id = %s
        ORDER BY m.memory_date DESC, m.memory_id DESC
        """,
        (user_id,)
    )
    memories = cursor.fetchall()
    for mem in memories:
        cursor.execute("SELECT * FROM MEDIA WHERE memory_id = %s", (mem["memory_id"],))
        mem["media"] = cursor.fetchall()
        cursor.execute("SELECT * FROM MEMORY_VERSION WHERE memory_id = %s ORDER BY version_id DESC", (mem["memory_id"],))
        mem["versions"] = cursor.fetchall()
    cursor.close()
    conn.close()
    return memories

@app.post("/api/memories/{memory_id}/upload-image")
async def upload_memory_image(memory_id: int, user_id: int = Form(...), file: UploadFile = File(...)):
    user_folder = os.path.join(UPLOAD_DIR, f"user_{user_id}")
    os.makedirs(user_folder, exist_ok=True)
    filename = f"{int(datetime.now().timestamp())}_{file.filename}"
    disk_path = os.path.join(user_folder, filename)
    with open(disk_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    db_file_path = f"/uploads/user_{user_id}/{filename}"
    conn = get_db_connection("root")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO MEDIA (memory_id, file_path) VALUES (%s, %s)",
        (memory_id, db_file_path)
    )
    conn.commit()
    media_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"media_id": media_id, "memory_id": memory_id, "file_path": db_file_path}
