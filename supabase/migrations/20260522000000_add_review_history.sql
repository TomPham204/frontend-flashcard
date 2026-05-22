-- Review History Table Definition
create table review_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  card_id uuid references flashcards(id) on delete cascade not null,
  rating text not null check (rating in ('Again', 'Hard', 'Good', 'Easy')),
  ease_factor real not null,
  interval_days real not null,
  reviewed_at timestamptz not null default now()
);

-- Enable RLS
alter table review_history enable row level security;

-- RLS Policies
create policy "Users can see their own review history"
  on review_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own review history"
  on review_history for insert
  with check (auth.uid() = user_id);

-- Indexing for performance
create index review_history_user_id_idx on review_history (user_id);
create index review_history_reviewed_at_idx on review_history (reviewed_at);
create index review_history_card_id_idx on review_history (card_id);

-- Add comment for clarity
comment on table review_history is 'Stores individual study review events for analytics and SRS tracking.';
