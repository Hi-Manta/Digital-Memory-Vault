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
