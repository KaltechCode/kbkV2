CREATE OR REPLACE FUNCTION public.increment_diagnostic_otp_attempt(_intake_id uuid, _max_attempts int)
RETURNS TABLE(new_attempts int, locked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_count int;
  _is_locked boolean;
BEGIN
  UPDATE public.financial_stress_test_intakes
  SET diagnostic_otp_attempts = COALESCE(diagnostic_otp_attempts, 0) + 1
  WHERE id = _intake_id
  RETURNING diagnostic_otp_attempts INTO _new_count;

  _is_locked := COALESCE(_new_count, 0) >= _max_attempts;

  IF _is_locked THEN
    UPDATE public.financial_stress_test_intakes
    SET diagnostic_otp_hash = NULL,
        diagnostic_otp_expires_at = NULL
    WHERE id = _intake_id;
  END IF;

  RETURN QUERY SELECT _new_count, _is_locked;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_diagnostic_otp_attempt(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_diagnostic_otp_attempt(uuid, int) TO service_role;