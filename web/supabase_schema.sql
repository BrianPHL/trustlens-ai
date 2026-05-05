-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  avatar_url text,
  scam_awareness_level text default 'beginner',
  immunity_score integer default 0,
  total_scans integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create scan_history table
create table scan_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  message_text text not null,
  risk_level text not null,
  risk_score integer not null,
  scam_percentage integer not null,
  suspicious_percentage integer not null,
  safe_percentage integer not null,
  signals_detected jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table scan_history enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Policies for scan_history
create policy "Users can view their own scan history." on scan_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own scan history." on scan_history
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own scan history." on scan_history
  for delete using (auth.uid() = user_id);

-- Create a trigger to automatically create a profile when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
