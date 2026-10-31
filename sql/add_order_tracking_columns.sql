-- Add persistent tracking fields to orders.
alter table public.orders
  add column if not exists tracking_code text,
  add column if not exists tracking_url text;
