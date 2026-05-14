-- Flashcards Table Definition
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  question text not null,
  answer text not null,
  code_snippet text,
  category text,
  tags text[] default '{}',
  difficulty text not null default 'New',
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table flashcards enable row level security;

-- RLS Policies
create policy "Users can see their own flashcards"
  on flashcards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
  on flashcards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
  on flashcards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
  on flashcards for delete
  using (auth.uid() = user_id);

-- Indexing for performance
create index flashcards_user_id_idx on flashcards (user_id);

-- Trigger for updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on flashcards
for each row
execute function handle_updated_at();
