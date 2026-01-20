-- Schema pour la base de données de réservation
-- PostgreSQL

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (synchronisée avec Clerk)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY, -- ID Clerk
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des ressources réservables
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  capacity INTEGER,
  location VARCHAR(255),
  amenities JSONB DEFAULT '[]'::jsonb,
  price_per_hour DECIMAL(10, 2),
  images JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  availability JSONB, -- Règles de disponibilité (jours/horaires)
  rules JSONB, -- Règles spécifiques (durée min/max)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'modified', 'cancelled', 'passed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Table des notifications email
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'reservation_created',
    'reservation_updated',
    'reservation_cancelled',
    'reservation_reminder',
    'account_deleted',
    'admin_notification'
  )),
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_resource_id ON reservations(resource_id);
CREATE INDEX idx_reservations_start_time ON reservations(start_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_resources_active ON resources(active);
CREATE INDEX idx_email_notifications_reservation_id ON email_notifications(reservation_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vue pour faciliter les requêtes de réservations avec détails
CREATE VIEW reservations_with_details AS
SELECT 
  r.id,
  r.resource_id,
  r.user_id,
  r.start_time,
  r.end_time,
  r.status,
  r.notes,
  r.created_at,
  r.updated_at,
  res.name AS resource_name,
  res.location AS resource_location,
  u.email AS user_email,
  u.full_name AS user_name
FROM reservations r
JOIN resources res ON r.resource_id = res.id
JOIN users u ON r.user_id = u.id;
