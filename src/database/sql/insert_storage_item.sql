INSERT INTO storage_items (path, download_url, uid, name, type, size)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;