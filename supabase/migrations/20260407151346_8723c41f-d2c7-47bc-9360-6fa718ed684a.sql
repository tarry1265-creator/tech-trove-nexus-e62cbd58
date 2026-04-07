
-- Create loyalty_points table for user balances
CREATE TABLE public.loyalty_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  points_balance integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert points" ON public.loyalty_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update points" ON public.loyalty_points FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public read for admin" ON public.loyalty_points FOR SELECT USING (true);

-- Create loyalty_transactions table for history
CREATE TABLE public.loyalty_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  points integer NOT NULL,
  type text NOT NULL DEFAULT 'earned',
  description text,
  order_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert transactions" ON public.loyalty_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read for admin" ON public.loyalty_transactions FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_loyalty_points_updated_at
BEFORE UPDATE ON public.loyalty_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
