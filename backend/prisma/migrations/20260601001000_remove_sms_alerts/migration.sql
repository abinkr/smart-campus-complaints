ALTER TABLE users
  DROP COLUMN IF EXISTS phone_number,
  DROP COLUMN IF EXISTS sms_critical_alerts;
