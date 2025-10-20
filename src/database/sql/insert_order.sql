INSERT INTO orders (uid, amount)
VALUES ($1, $2)
RETURNING *;