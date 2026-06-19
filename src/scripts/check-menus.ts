import { DataSource } from 'typeorm';

async function checkMenus() {
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

    // Check all menus
    const menus = await dataSource.query('SELECT id, label, router FROM menu ORDER BY id');
    console.log('=== All Menus ===');
    menus.forEach((m: any) => console.log(`ID: ${m.id}, Label: ${m.label}, Router: ${m.router}`));

    // Check role
    const roles = await dataSource.query('SELECT id, name FROM role');
    console.log('\n=== All Roles ===');
    roles.forEach((r: any) => console.log(`ID: ${r.id}, Name: ${r.name}`));

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

checkMenus();
