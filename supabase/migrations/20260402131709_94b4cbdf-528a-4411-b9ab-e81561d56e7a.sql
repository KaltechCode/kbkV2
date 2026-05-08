
CREATE TABLE public.stripe_checkout_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  customer_name text,
  customer_email text,
  product_name text,
  amount_paid integer,
  currency text,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_checkout_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to checkout events"
  ON public.stripe_checkout_events
  FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "Admins can view checkout events"
  ON public.stripe_checkout_events
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
