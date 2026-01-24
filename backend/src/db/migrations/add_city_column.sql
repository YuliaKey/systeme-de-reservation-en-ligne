-- Migration: Ajout de la colonne city pour filtrer les salles par ville
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Créer un index pour optimiser les recherches par ville
CREATE INDEX IF NOT EXISTS idx_resources_city ON resources(city);

-- Mettre à jour les salles existantes avec une ville par défaut
UPDATE resources 
SET city = 'Paris' 
WHERE city IS NULL;

-- Rendre la colonne NOT NULL après avoir défini les valeurs par défaut
ALTER TABLE resources 
ALTER COLUMN city SET NOT NULL;
