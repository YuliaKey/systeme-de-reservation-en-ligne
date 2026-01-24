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
        ('user_test_user2', 'user2@test.com', 'Marie Martin', 'user'),
        ('user_test_user3', 'user3@test.com', 'Sophie Bernard', 'user'),
        ('user_test_user4', 'user4@test.com', 'Thomas Petit', 'user'),
        ('user_test_user5', 'user5@test.com', 'Claire Dubois', 'user'),
        ('user_test_user6', 'user6@test.com', 'Luc Moreau', 'user')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log("Utilisateurs de test créés");

    // 2. Créer des ressources de test
    const resourcesResult = await pool.query(`
      INSERT INTO resources (name, description, capacity, location, city, amenities, price_per_hour, active, availability, rules, images) 
      VALUES 
        (
          'Salle de réunion A',
          'Grande salle lumineuse avec vue panoramique. Parfaite pour les réunions d''équipe et présentations.',
          10,
          '15 Rue de la Paix, 75010 Paris',
          'Paris',
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
          '23 Avenue des Champs, 75008 Paris',
          'Paris',
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
          '45 Boulevard Haussmann, 75009 Paris',
          'Paris',
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
          '78 Rue du Faubourg Saint-Honoré, 75008 Paris',
          'Paris',
          '["wifi", "ecran", "tableau", "visio", "projecteur"]'::jsonb,
          80.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "09:00", "end": "18:00"}]}'::jsonb,
          '{"minDurationMinutes": 120, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1505373877841-8d25f7d46678"]'::jsonb
        ),
        (
          'Salle Nice Promenade',
          'Salle moderne avec vue sur la mer, idéale pour les réunions créatives.',
          12,
          '10 Promenade des Anglais, 06000 Nice',
          'Nice',
          '["wifi", "ecran", "visio", "tableau"]'::jsonb,
          45.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "09:00", "end": "18:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1497366412874-3415097a27e7"]'::jsonb
        ),
        (
          'Coworking Nice Centre',
          'Espace de coworking lumineux au cœur de Nice.',
          15,
          '32 Avenue Jean Médecin, 06000 Nice',
          'Nice',
          '["wifi", "cafe", "imprimante"]'::jsonb,
          20.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5,6], "timeRanges": [{"start": "08:00", "end": "20:00"}]}'::jsonb,
          '{"minDurationMinutes": 60, "maxDurationMinutes": 600}'::jsonb,
          '["https://images.unsplash.com/photo-1497366858526-0766cadbe8fa"]'::jsonb
        ),
        (
          'Salle Lyon Part-Dieu',
          'Salle équipée dans le quartier d''affaires.',
          8,
          '5 Rue de la Villette, 69003 Lyon',
          'Lyon',
          '["wifi", "ecran", "visio", "projecteur"]'::jsonb,
          40.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "08:00", "end": "19:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1497215842964-222b430dc094"]'::jsonb
        ),
        (
          'Lyon Confluence Meeting',
          'Salle design dans le quartier moderne de Confluence.',
          6,
          '12 Cours Charlemagne, 69002 Lyon',
          'Lyon',
          '["wifi", "ecran", "tableau"]'::jsonb,
          35.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "09:00", "end": "18:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 360}'::jsonb,
          '["https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3"]'::jsonb
        ),
        (
          'Bordeaux Chartrons',
          'Salle chaleureuse dans le quartier des Chartrons.',
          10,
          '18 Rue Notre Dame, 33000 Bordeaux',
          'Bordeaux',
          '["wifi", "ecran", "visio"]'::jsonb,
          38.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "09:00", "end": "18:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1497366811353-6870744d04b2"]'::jsonb
        ),
        (
          'Marseille Vieux-Port',
          'Salle avec vue sur le Vieux-Port, ambiance méditerranéenne.',
          14,
          '25 Quai des Belges, 13001 Marseille',
          'Marseille',
          '["wifi", "ecran", "visio", "cafe"]'::jsonb,
          42.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "09:00", "end": "18:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1497215728101-856f4ea42174"]'::jsonb
        ),
        (
          'Marseille Euromed',
          'Salle moderne dans le nouveau quartier d''affaires.',
          8,
          '10 Boulevard de Dunkerque, 13002 Marseille',
          'Marseille',
          '["wifi", "ecran", "visio", "tableau", "projecteur"]'::jsonb,
          50.00,
          true,
          '{"daysOfWeek": [1,2,3,4,5], "timeRanges": [{"start": "08:00", "end": "19:00"}]}'::jsonb,
          '{"minDurationMinutes": 30, "maxDurationMinutes": 480}'::jsonb,
          '["https://images.unsplash.com/photo-1497366754035-f200968a6e72"]'::jsonb
        )
      RETURNING id
    `);
    console.log("Ressources de test créées:", resourcesResult.rowCount);

    // 3. Créer des réservations de test (actives, passées et annulées)
    const resourceIds = resourcesResult.rows.map((r) => r.id);

    await pool.query(
      `
      INSERT INTO reservations (resource_id, user_id, start_time, end_time, status, notes) 
      VALUES 
        -- Réservations actives (futures)
        (
          $1,
          'user_test_user1',
          CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '9 hours',
          CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '11 hours',
          'active',
          'Réunion d''équipe hebdomadaire'
        ),
        (
          $2,
          'user_test_user2',
          CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '14 hours',
          CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '16 hours',
          'active',
          'Présentation client'
        ),
        (
          $3,
          'user_test_user3',
          CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '10 hours',
          CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '12 hours',
          'active',
          'Session de brainstorming'
        ),
        (
          $4,
          'user_test_user4',
          CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '9 hours',
          CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '17 hours',
          'active',
          'Formation journée complète'
        ),
        (
          $5,
          'user_test_user5',
          CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '14 hours',
          CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '16 hours',
          'active',
          'Entretien d''embauche'
        ),
        
        -- Réservations passées
        (
          $1,
          'user_test_user1',
          CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '10 hours',
          CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '12 hours',
          'passed',
          'Réunion équipe - terminée'
        ),
        (
          $2,
          'user_test_user2',
          CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '14 hours',
          CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '16 hours',
          'passed',
          'Présentation projet - succès'
        ),
        (
          $6,
          'user_test_user3',
          CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '9 hours',
          CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '11 hours',
          'passed',
          'Workshop créatif - Nice'
        ),
        (
          $7,
          'user_test_user4',
          CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '10 hours',
          CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '12 hours',
          'passed',
          'Réunion d''équipe Lyon'
        ),
        (
          $8,
          'user_test_user5',
          CURRENT_TIMESTAMP - INTERVAL '14 days' + INTERVAL '14 hours',
          CURRENT_TIMESTAMP - INTERVAL '14 days' + INTERVAL '17 hours',
          'passed',
          'Formation Lyon - 3h'
        ),
        
        -- Réservations annulées
        (
          $3,
          'user_test_user1',
          CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '15 hours',
          CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '17 hours',
          'cancelled',
          'Annulée - changement de planning'
        ),
        (
          $9,
          'user_test_user2',
          CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '10 hours',
          CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '12 hours',
          'cancelled',
          'Annulée - client absent'
        ),
        (
          $10,
          'user_test_user6',
          CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '9 hours',
          CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '11 hours',
          'cancelled',
          'Annulée - problème technique'
        ),
        (
          $11,
          'user_test_user3',
          CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '14 hours',
          CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '16 hours',
          'cancelled',
          'Annulée - report'
        ),
        
        -- Réservations multiples pour user6
        (
          $4,
          'user_test_user6',
          CURRENT_TIMESTAMP + INTERVAL '8 days' + INTERVAL '10 hours',
          CURRENT_TIMESTAMP + INTERVAL '8 days' + INTERVAL '12 hours',
          'active',
          'Réunion importante'
        ),
        (
          $5,
          'user_test_user6',
          CURRENT_TIMESTAMP - INTERVAL '6 days' + INTERVAL '14 hours',
          CURRENT_TIMESTAMP - INTERVAL '6 days' + INTERVAL '16 hours',
          'passed',
          'Réunion Nice - terminée'
        )
    `,
      resourceIds.slice(0, 11),
    );
    console.log("Réservations de test créées (actives, passées et annulées)");

    console.log("\n✅ Données de test insérées avec succès!");
    console.log("\n👥 Comptes de test:");
    console.log("   Admin: admin@test.com (user_test_admin)");
    console.log("   User1: user1@test.com (Jean Dupont)");
    console.log("   User2: user2@test.com (Marie Martin)");
    console.log("   User3: user3@test.com (Sophie Bernard)");
    console.log("   User4: user4@test.com (Thomas Petit)");
    console.log("   User5: user5@test.com (Claire Dubois)");
    console.log("   User6: user6@test.com (Luc Moreau)");
    console.log("\n🏢 Salles créées dans 5 villes:");
    console.log("   - Paris: 4 salles");
    console.log("   - Nice: 2 salles");
    console.log("   - Lyon: 2 salles");
    console.log("   - Bordeaux: 1 salle");
    console.log("   - Marseille: 2 salles");
    console.log("\n📅 Réservations:");
    console.log("   - 5 réservations actives (futures)");
    console.log("   - 5 réservations passées (status: passed)");
    console.log("   - 4 réservations annulées");
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
