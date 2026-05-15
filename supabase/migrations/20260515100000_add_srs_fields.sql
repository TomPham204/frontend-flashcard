-- Add Spaced Repetition System (SRS) columns to flashcards

alter table flashcards
add column interval_days real not null default 0,
add column ease_factor real not null default 2.5,
add column review_count integer not null default 0,
add column lapse_count integer not null default 0;

-- Rename next_review_at to due_date to better reflect the SRS model terminology
alter table flashcards rename column next_review_at to due_date;
