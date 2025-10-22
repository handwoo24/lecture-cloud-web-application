INSERT INTO messaging_tokens (
    uid,
    fcm_token
)
VALUES ($1, $2)
ON CONFLICT (fcm_token)
DO UPDATE SET
    uid = EXCLUDED.uid,
    updated_at = now();