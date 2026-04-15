-- Remove duplicate user records (keeps the oldest per user_auth_id)
DELETE FROM users a
USING users b
WHERE a.user_auth_id = b.user_auth_id
  AND a.created_at > b.created_at;

-- Prevent future duplicates
ALTER TABLE users ADD CONSTRAINT users_user_auth_id_unique UNIQUE (user_auth_id);
