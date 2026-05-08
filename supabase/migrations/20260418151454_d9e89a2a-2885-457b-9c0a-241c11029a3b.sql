SELECT name, length(decrypted_secret) AS len, left(decrypted_secret, 12) AS prefix
FROM vault.decrypted_secrets
ORDER BY name;