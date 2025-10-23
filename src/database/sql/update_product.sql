UPDATE products
SET
    name = $2,
    price = $3,
    stock = $4,
    picture = $5
WHERE
    id = $1
RETURNING *;