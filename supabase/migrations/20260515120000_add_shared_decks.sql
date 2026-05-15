-- Decks Table Definition
create table decks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null default auth.uid(),
    title text not null,
    description text,
    category text,
    tags text[] default '{}',
    is_public boolean default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS
alter table decks enable row level security;

-- RLS Policies for decks
create policy "Users can see their own decks"
  on decks for select
  using (auth.uid() = user_id);

create policy "Public decks are visible to everyone"
  on decks for select
  using (is_public = true);

create policy "Users can insert their own decks"
  on decks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own decks"
  on decks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own decks"
  on decks for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index decks_user_id_idx on decks (user_id);
create index decks_is_public_idx on decks (is_public) where is_public = true;

-- Trigger for updated_at
create trigger set_updated_at
before update on decks
for each row
execute function handle_updated_at();

-- Update flashcards table
alter table flashcards
add column deck_id uuid references decks(id) on delete cascade;

create index flashcards_deck_id_idx on flashcards (deck_id);

-- Add public read policy to flashcards
create policy "Cards in public decks are visible to everyone"
  on flashcards for select
  using (
    deck_id in (select id from decks where is_public = true)
  );
