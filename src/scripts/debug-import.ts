import { DataSource } from 'typeorm';

async function debugImport() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_DATABASE || 'south_admin',
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // Check each table
    const tables = ['user', 'role', 'permission', 'menu', 'role_permission', 'user_permission', 'role_menu'];

    for (const table of tables) {
      try {
        const result = await dataSource.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`Table ${table}: ${result[0].count} rows`);
      } catch (err) {
        console.log(`Table ${table}: does not exist or error`);
      }
    }

    // Check permissions
    const permissions = await dataSource.query('SELECT id, name FROM permission LIMIT 10');
    console.log('\n=== Sample Permissions ===');
    permissions.forEach((p: any) => console.log(`ID: ${p.id}, Name: ${p.name}`));

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

debugImport();
