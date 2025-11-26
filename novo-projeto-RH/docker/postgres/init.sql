-- Initialize PostgreSQL database for RH Plus

-- Create database if it doesn't exist
CREATE DATABASE rhplus_dev;
CREATE DATABASE rhplus_test;

-- Create extensions
\c rhplus_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c rhplus_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";