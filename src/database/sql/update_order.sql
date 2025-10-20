UPDATE orders
SET 
    confirmed = TRUE,
    payment_key = $2,
    payment_type = $3,
    confirmed_at = NOW() 
WHERE 
    id = $1;