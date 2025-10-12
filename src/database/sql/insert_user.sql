WITH new_user AS (
    INSERT INTO users (name, email, email_verified, picture)
    VALUES ($1, $2, $3, $4)
    RETURNING * 
),
new_account AS (
    INSERT INTO accounts (uid, provider, provider_account_id)
    SELECT id, $5, $6 FROM new_user
)
SELECT * FROM new_user;