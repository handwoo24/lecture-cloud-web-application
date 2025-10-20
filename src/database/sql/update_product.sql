UPDATE products
SET
    stock = stock + $2
WHERE
    id = $1
    AND (stock + $2) >= 0
RETURNING id, stock;