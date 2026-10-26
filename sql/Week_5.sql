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
