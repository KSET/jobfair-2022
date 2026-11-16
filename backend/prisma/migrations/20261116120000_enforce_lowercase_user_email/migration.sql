-- Emails are stored trimmed + lowercase (UserService.normalizeEmail)
ALTER TABLE "User"
  ADD CONSTRAINT "User_email_normalized_check"
  CHECK ("email" = lower(btrim("email")));
