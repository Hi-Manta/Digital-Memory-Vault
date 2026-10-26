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
