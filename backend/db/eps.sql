DROP DATABASE IF EXISTS eps;

CREATE SCHEMA eps DEFAULT CHARACTER SET utf8;
USE eps;

CREATE TABLE users (
    usersId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    image VARCHAR(255),
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE providers (
    providerId INT AUTO_INCREMENT PRIMARY KEY,
    usersId INT NOT NULL UNIQUE,
    specialty VARCHAR(100) NOT NULL
);
CREATE TABLE appointments (
    appointmentId INT AUTO_INCREMENT PRIMARY KEY,
    usersId INT NOT NULL,
    providerId INT NOT NULL,
    appointmentDate DATE NOT NULL,
    appointmentTime TIME NOT NULL,
    reason VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*KEY CONSTRAINTS:*/
ALTER TABLE providers
ADD CONSTRAINT fk_provider_user
FOREIGN KEY (usersId) REFERENCES users(usersId);

ALTER TABLE appointments
ADD CONSTRAINT fk_appointment_patient1
FOREIGN KEY (usersId) REFERENCES users(usersId);

ALTER TABLE appointments
ADD CONSTRAINT fk_appointment_patient2
FOREIGN KEY (providerId) REFERENCES providers(providerId);