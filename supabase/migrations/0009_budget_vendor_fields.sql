-- Adds a planned total budget and per-category allocations to invites, and a
-- next-payment due date to vendors, for the redesigned Budget and Vendors pages.

alter table public.invites add column if not exists total_budget numeric(12,2);
alter table public.invites add column if not exists category_budgets jsonb not null default '{}'::jsonb;

alter table public.vendors add column if not exists due_date date;
