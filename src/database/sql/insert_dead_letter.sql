INSERT INTO dead_letters (subscription, data, message_id, publish_time)
VALUES ($1, $2, $3, $4)
RETURNING *;