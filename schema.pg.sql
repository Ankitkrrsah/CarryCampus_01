-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    institute_email VARCHAR(100) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    selfie_url TEXT,
    password_hash TEXT NOT NULL,
    
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'STUDENT', -- STUDENT or ADMIN
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table (For capacity checking)
CREATE TABLE IF NOT EXISTS rooms (
    room_number VARCHAR(20) PRIMARY KEY,
    max_capacity INT DEFAULT 3
);

-- Verification Requests (Admin Approval)
CREATE TABLE IF NOT EXISTS verification_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    verified_by INT REFERENCES users(id),
    verified_at TIMESTAMP
);

-- Delivery Requests
CREATE TABLE IF NOT EXISTS delivery_requests (
    id SERIAL PRIMARY KEY,
    requester_id INT NOT NULL REFERENCES users(id),
    pickup_location VARCHAR(255) DEFAULT 'Main Gate',
    drop_location VARCHAR(255) NOT NULL,
    reward_amount INT DEFAULT 10,
    
    
    parcel_weight VARCHAR(50),
    parcel_type VARCHAR(50),
    expected_time VARCHAR(50),

    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'PICKED', 'DELIVERED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Assignments (Atomic Locks)
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id SERIAL PRIMARY KEY,
    delivery_request_id INT NOT NULL UNIQUE REFERENCES delivery_requests(id),
    delivery_person_id INT NOT NULL REFERENCES users(id),
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Transactions (Wallet/Settlement)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    delivery_request_id INT NOT NULL REFERENCES delivery_requests(id),
    paid_by INT NOT NULL REFERENCES users(id),
    paid_to INT NOT NULL REFERENCES users(id),
    amount INT NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications (In-App)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets (Earnings)
CREATE TABLE IF NOT EXISTS wallets (
    user_id INT PRIMARY KEY REFERENCES users(id),
    balance INT DEFAULT 0,
    total_earnings INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews (Ratings)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    delivery_request_id INT NOT NULL REFERENCES delivery_requests(id),
    reviewer_id INT NOT NULL REFERENCES users(id),
    reviewee_id INT NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(delivery_request_id)
);

-- Password Resets (Forgot Password OTPs)
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);