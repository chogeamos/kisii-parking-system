
-- parking.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  reg_number VARCHAR(20) NOT NULL UNIQUE,
  owner_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE parking_sessions (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_ref VARCHAR(100),
  payment_status VARCHAR(30) DEFAULT 'pending',
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE fines (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  amount_cents INTEGER NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE TABLE stk_requests (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20),
  amount_cents INTEGER,
  mpesa_checkout_request_id VARCHAR(200),
  plate_reg_number VARCHAR(50),
  account_ref VARCHAR(100),
  status VARCHAR(30) DEFAULT 'initiated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_parking_vehicle ON parking_sessions(vehicle_id);
