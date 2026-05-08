
DROP POLICY "Users can update verification status on own leads" ON public.leads;

CREATE POLICY "Users can update verification status on own leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    (auth.uid() = user_id)
    AND (first_name = (SELECT l.first_name FROM public.leads l WHERE l.id = leads.id))
    AND (last_name  = (SELECT l.last_name  FROM public.leads l WHERE l.id = leads.id))
    AND (phone      = (SELECT l.phone      FROM public.leads l WHERE l.id = leads.id))
    AND (email      = (SELECT l.email      FROM public.leads l WHERE l.id = leads.id))
  );
