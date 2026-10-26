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

USE DIGITAL_MEMORY_VAULT;

INSERT INTO `USER` (name, email, password_hash)
VALUES ('Himanta', 'himanta@gmail.com', 'pass_123');

INSERT INTO MEMORY (user_id, title, description, memory_date)
VALUES (1, 'Visited CVASU Fish Museum', 'Enjoyed watching different kind of fishes with friends', CURDATE());

INSERT INTO MEMORY_VERSION (memory_id, title_snapshot, description_snapshot, memory_date_snapshot, change_type)
SELECT memory_id, title, description, memory_date, 'EDIT'
FROM MEMORY WHERE memory_id = 1;

UPDATE MEMORY
SET title = 'Visited CVASU Fisheries Museum (Updated)',
    description = 'Enjoyed watching different kind of fishes with friends. But the Anatomy Museum was closed today.'
WHERE memory_id = 1;

UPDATE MEMORY SET status = 'TRASHED' WHERE memory_id = 1;
UPDATE MEMORY SET status = 'ACTIVE' WHERE memory_id = 1;

USE DIGITAL_MEMORY_VAULT;

DELIMITER //
CREATE TRIGGER trg_memory_before_update
BEFORE UPDATE ON MEMORY
FOR EACH ROW
BEGIN
    IF OLD.title <> NEW.title
       OR OLD.description <> NEW.description
       OR OLD.memory_date <> NEW.memory_date THEN
        INSERT INTO MEMORY_VERSION (memory_id, title_snapshot, description_snapshot, memory_date_snapshot, change_type)
        VALUES (OLD.memory_id, OLD.title, OLD.description, OLD.memory_date, 'EDIT');
    END IF;
END //

CREATE PROCEDURE sp_create_memory (
    IN p_user_id INT,
    IN p_title VARCHAR(150),
    IN p_description TEXT,
    IN p_memory_date DATE,
    IN p_location_id INT,
    IN p_emotion_id INT
)
BEGIN
    INSERT INTO MEMORY (user_id, title, description, memory_date, location_id, emotion_id)
    VALUES (p_user_id, p_title, p_description, p_memory_date, p_location_id, p_emotion_id);
    SELECT LAST_INSERT_ID() AS new_memory_id;
END //

CREATE PROCEDURE sp_day_reconstruction (
    IN p_user_id INT,
    IN p_date DATE
)
BEGIN
    SELECT m.memory_id, m.title, m.description, m.memory_time,
           l.location_name, e.emotion_name
    FROM MEMORY m
    LEFT JOIN LOCATION l ON m.location_id = l.location_id
    LEFT JOIN EMOTION e ON m.emotion_id = e.emotion_id
    WHERE m.user_id = p_user_id
      AND m.memory_date = p_date
      AND m.status = 'ACTIVE';
END //
DELIMITER ;

CREATE OR REPLACE VIEW active_memory_overview AS
SELECT m.memory_id, m.user_id, m.title, m.memory_date, m.memory_time,
       l.location_name, e.emotion_name
FROM MEMORY m
LEFT JOIN LOCATION l ON m.location_id = l.location_id
LEFT JOIN EMOTION e ON m.emotion_id = e.emotion_id
WHERE m.status = 'ACTIVE';

USE DIGITAL_MEMORY_VAULT;

INSERT INTO LOCATION (user_id, location_name) VALUES (1, 'CVASU');
INSERT INTO EMOTION (user_id, emotion_name) VALUES (1, 'Happy');
INSERT INTO TAG (user_id, tag_name) VALUES (1, 'Tour');
INSERT INTO TAG (user_id, tag_name) VALUES (1, 'Research');

UPDATE MEMORY
SET location_id = (SELECT location_id FROM LOCATION WHERE location_name='CVASU' AND user_id=1 LIMIT 1),
    emotion_id  = (SELECT emotion_id FROM EMOTION WHERE emotion_name='Happy' AND user_id=1 LIMIT 1)
WHERE memory_id = 1;

INSERT INTO MEMORY_TAG (memory_id, tag_id)
VALUES (1, (SELECT tag_id FROM TAG WHERE tag_name='Tour' AND user_id=1 LIMIT 1));

INSERT INTO PERSON (user_id, name, relationship) VALUES (1, 'Claude', 'Assistant');

INSERT INTO MEMORY (user_id, title, description, memory_date)
VALUES (1, 'Research on Morphogenesis', 'Learnt many things about this interesting Topic', '2026-09-27');

START TRANSACTION;
SET @new_memory_id = LAST_INSERT_ID();
INSERT INTO MEMORY_PERSON (memory_id, person_id)
VALUES (@new_memory_id, (SELECT person_id FROM PERSON WHERE name='Claude' AND user_id=1 LIMIT 1));
INSERT INTO MEMORY_TAG (memory_id, tag_id)
VALUES (@new_memory_id, (SELECT tag_id FROM TAG WHERE tag_name='Research' AND user_id=1 LIMIT 1));
COMMIT;

USE DIGITAL_MEMORY_VAULT;

CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'App@52';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON DIGITAL_MEMORY_VAULT.* TO 'app_user'@'localhost';

CREATE USER IF NOT EXISTS 'report_user'@'localhost' IDENTIFIED BY 'Report@52';
GRANT SELECT ON DIGITAL_MEMORY_VAULT.* TO 'report_user'@'localhost';

UPDATE `USER` SET password_hash = SHA2('HIMANTA_pass_123', 256) WHERE user_id = 1;

INSERT INTO `USER` (name, email, password_hash)
VALUES ('Ovi', 'fat_ovi@gmail.com', SHA2('OVI_pass_123', 256));

SET @uid2 = (SELECT user_id FROM `USER` WHERE email = 'fat_ovi@gmail.com');
INSERT INTO MEMORY (user_id, title, description, memory_date)
VALUES (@uid2, 'Ovi Private Memory', 'Only Ovi should see this', CURDATE());

CREATE INDEX idx_memory_date ON MEMORY(memory_date);
CREATE INDEX idx_memory_status ON MEMORY(status);
CREATE INDEX idx_memory_user_date ON MEMORY(user_id, memory_date);
