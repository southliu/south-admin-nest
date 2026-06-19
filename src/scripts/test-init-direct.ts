import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function testInitDirect() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_DATABASE || 'south_admin',
    synchronize: false,
    logging: false,
    multipleStatements: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // Read the entire init.sql file and execute it as-is
    const sqlFilePath = path.join(__dirname, '../../init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('Executing init.sql file...');
    await dataSource.query(sqlContent);

    console.log('init.sql executed successfully!');

    // Verify data
    const result = await dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM user) as users,
        (SELECT COUNT(*) FROM role) as roles,
        (SELECT COUNT(*) FROM permission) as permissions,
        (SELECT COUNT(*) FROM menu) as menus,
        (SELECT COUNT(*) FROM role_menu) as role_menus
    `);

    console.log('\n=== Imported Data Summary ===');
    console.log(`Users: ${result[0].users}`);
    console.log(`Roles: ${result[0].roles}`);
    console.log(`Permissions: ${result[0].permissions}`);
    console.log(`Menus: ${result[0].menus}`);
    console.log(`Role-Menu associations: ${result[0].role_menus}`);

    await dataSource.destroy();
  } catch (error: any) {
    console.error('Error:', error.message);
    await dataSource.destroy();
    process.exit(1);
  }
}

testInitDirect();
