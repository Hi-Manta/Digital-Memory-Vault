-- Digital Memory Vault Database (Week 3 Schema)
CREATE DATABASE IF NOT EXISTS DIGITAL_MEMORY_VAULT;
USE DIGITAL_MEMORY_VAULT;

CREATE TABLE `USER` (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LOCATION (
    location_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE
);

CREATE TABLE EMOTION (
    emotion_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NULL,
    emotion_name  VARCHAR(50) NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE
);

CREATE TABLE PERSON (
    person_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    name          VARCHAR(100) NOT NULL,
    relationship  VARCHAR(50),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE
);

CREATE TABLE TAG (
    tag_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    tag_name      VARCHAR(50) NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE
);

CREATE TABLE MEMORY (
    memory_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    title         VARCHAR(150) NOT NULL,
    description   TEXT,
    memory_date   DATE NOT NULL,
    memory_time   TIME NULL,
    location_id   INT NULL,
    emotion_id    INT NULL,
    status        ENUM('ACTIVE','TRASHED') NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES `USER`(user_id)       ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id) ON DELETE SET NULL,
    FOREIGN KEY (emotion_id)  REFERENCES EMOTION(emotion_id)   ON DELETE SET NULL
);

CREATE TABLE MEDIA (
    media_id      INT AUTO_INCREMENT PRIMARY KEY,
    memory_id     INT NOT NULL,
    file_path     VARCHAR(255) NOT NULL,
    uploaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memory_id) REFERENCES MEMORY(memory_id) ON DELETE CASCADE
);

CREATE TABLE MEMORY_VERSION (
    version_id            INT AUTO_INCREMENT PRIMARY KEY,
    memory_id             INT NOT NULL,
    title_snapshot        VARCHAR(150),
    description_snapshot  TEXT,
    memory_date_snapshot  DATE,
    changed_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    change_type           VARCHAR(20),
    FOREIGN KEY (memory_id) REFERENCES MEMORY(memory_id) ON DELETE CASCADE
);

CREATE TABLE MEMORY_PERSON (
    memory_id  INT NOT NULL,
    person_id  INT NOT NULL,
    PRIMARY KEY (memory_id, person_id),
    FOREIGN KEY (memory_id) REFERENCES MEMORY(memory_id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id) ON DELETE CASCADE
);

CREATE TABLE MEMORY_TAG (
    memory_id  INT NOT NULL,
    tag_id     INT NOT NULL,
    PRIMARY KEY (memory_id, tag_id),
    FOREIGN KEY (memory_id) REFERENCES MEMORY(memory_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)    REFERENCES TAG(tag_id)       ON DELETE CASCADE
);
