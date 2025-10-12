SELECT users.*
FROM accounts
INNER JOIN
    users ON accounts.uid = users.id
WHERE accounts.provider = $1
    AND accounts.provider_account_id = $2
    LIMIT 1;