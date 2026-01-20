import { pool } from "../config/database.js";

async function seed(): Promise<void> {
  console.log("🌱 Insertion des données de test...");

  try {
    // 1. Créer des utilisateurs de test
    await pool.query(`
      INSERT INTO users (id, email, full_name, role) 
      VALUES 
        ('user_test_admin', 'admin@test.com', 'Admin Test', 'admin'),
        ('user_test_user1', 'user1@test.com', 'Jean Dupont', 'user'),
        ('user_test_user2', 'user2@test.com', 'Marie Martin', 'user')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log("Utilisateurs de test créés");

    // 2. Créer des ressources de test
    const resourcesResult = await pool.query(`
      INSERT INTO resources (name, description, capacity, location, amenities, price_per_hour, active, availability, rules, images) 
      VALUES 
        (
          'Salle de réunion A',
          'Grande salle lumineuse avec vue panoramique. Parfaite pour les réunions d''équipe et présentations.',
          10,
          'Paris 10ème - Bâtiment A',
          '["wifi", "ecran", "tableau", "visio"]'::jsonb,
          50.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "09:00", "end": "18:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1497366216548-37526070297c"]'::jsonb
        ),
        (
          'Salle de réunion B',
          'Salle intime pour petites réunions et entretiens confidentiels.',
          4,
          'Paris 10ème - Bâtiment B',
          '["wifi", "ecran", "visio"]'::jsonb,
          30.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "08:00", "end": "19:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 240}'::jsonb,
          '["https://images.unsplash.com/photo-1497366811353-6870744d04b2"]'::jsonb
        ),
        (
          'Espace Coworking',
          'Espace de travail partagé avec accès à tous les équipements.',
          20,
          'Paris 10ème - Bâtiment C',
          '["wifi", "cafe", "imprimante", "casiers"]'::jsonb,
          15.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5,6], "timeRanges": [{"start": "08:00", "end": "20:00"}]}'::jsonb,
          '{"minDurationMinutes": 60, "maxDurationMinutes": 600}'::jsonb,
          '["https://images.unsplash.com/photo-1497366754035-f200968a6e72"]'::jsonb
        ),
        (
          'Salle de formation',
          'Grande salle modulable pour formations et ateliers.',
          25,
          'Paris 10ème - Bâtiment A',
          '["wifi", "ecran", "tableau", "visio", "projecteur"]'::jsonb,
          80.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "09:00", "end": "18:00"}]}'::jsonb,
          '{"minDurationMinutes": 120, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1505373877841-8d25f7d46678"]'::jsonb
        )
      RETURNING id
    `);
    console.log("Ressources de test créées:", resourcesResult.rowCount);

    // 3. Créer quelques réservations de test
    const resourceId1 = resourcesResult.rows[0].id;
    await pool.query(
      `
      INSERT INTO reservations (resource_id, user_id, start_time, end_time, status, notes) 
      VALUES 
        (
          $1,
          'user_test_user1',
          CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '9 hours',
          CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '11 hours',
          'active',
          'Réunion d''équipe hebdomadaire'
        ),
        (
          $1,
          'user_test_user2',
          CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '14 hours',
          CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '16 hours',
          'active',
          'Présentation client'
        )
    `,
      [resourceId1],
    );
    console.log("Réservations de test créées");

    console.log("\n Données de test insérées avec succès!");
    console.log("\n Comptes de test:");
    console.log("   Admin: admin@test.com (user_test_admin)");
    console.log("   User1: user1@test.com (user_test_user1)");
    console.log("   User2: user2@test.com (user_test_user2)");
  } catch (error) {
    console.error(
      "Erreur lors de l'insertion des données:",
      (error as Error).message,
    );
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
