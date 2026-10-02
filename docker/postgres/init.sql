-- Executed once when the local PostgreSQL container is first created.
-- Creates the database used by the API integration tests (reset on every test run).
CREATE DATABASE hikeup_test OWNER CURRENT_USER;
