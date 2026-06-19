import { DataSource } from 'typeorm';

async function debugMenuInsert() {
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

    // Test the problematic query
    const testQuery = `
      SELECT '用户列表', 'Index', 3, NULL, 0, 1, NOW(), NOW(), id, 0, pid
      FROM menu parent_menu, (SELECT id AS pid FROM permission WHERE name = '/authority/user/index') AS p
      WHERE parent_menu.router = '/system/user'
    `;

    console.log('Testing query...');
    console.log('Query:', testQuery);

    try {
      const result = await dataSource.query(testQuery);
      console.log('Result:', result);
      console.log('Number of columns:', Object.keys(result[0] || {}).length);
    } catch (err: any) {
      console.error('Query failed:', err.message);
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

debugMenuInsert();
