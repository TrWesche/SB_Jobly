CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text UNIQUE NOT NULL,
    num_employees integer NOT NULL,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL,
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted date
);

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE NOT NULL,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT false
);

CREATE TABLE applications (
    username text REFERENCES users ON DELETE CASCADE,
    job_id integer REFERENCES jobs ON DELETE CASCADE,
    state text NOT NULL,
    created_at timestamp with time zone,
    PRIMARY KEY (username, job_id)
);