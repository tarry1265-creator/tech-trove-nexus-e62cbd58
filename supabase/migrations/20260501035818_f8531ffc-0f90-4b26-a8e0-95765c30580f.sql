-- Add delivery tracking fields to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_by TEXT,
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
  ADD COLUMN IF NOT EXISTS delivery_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS dispatcher_assigned TEXT,
  ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state TEXT;

-- Dispatch events audit trail
CREATE TABLE IF NOT EXISTS public.dispatch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  notes TEXT,
  dispatcher_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_events_order_id ON public.dispatch_events(order_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_events_created_at ON public.dispatch_events(created_at DESC);

ALTER TABLE public.dispatch_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dispatch events"
  ON public.dispatch_events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert dispatch events"
  ON public.dispatch_events FOR INSERT
  WITH CHECK (true);

-- Delivery proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Delivery proofs are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'delivery-proofs');

CREATE POLICY "Anyone can upload delivery proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'delivery-proofs');
