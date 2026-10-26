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
