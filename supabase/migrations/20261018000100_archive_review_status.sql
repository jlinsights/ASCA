-- Enum expansion must commit before the new value is used. Forward-only.
alter type public.artwork_status add value if not exists 'pending_review';
