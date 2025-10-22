SELECT 
    messaging_tokens.*
FROM 
    orders
INNER JOIN 
    messaging_tokens ON messaging_tokens.uid = orders.uid
WHERE 
    orders.id = $1;