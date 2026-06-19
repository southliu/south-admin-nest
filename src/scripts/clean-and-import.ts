import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function cleanAndImport() {
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

    // Clean existing data
    console.log('Cleaning existing data...');
    const tables = [
      'role_menu',
      'user_permission',
      'role_permission',
      'user_role',
      'menu',
      'permission',
      'role',
      'user',
    ];

    for (const table of tables) {
      try {
        await dataSource.query(`DELETE FROM ${table}`);
        console.log(`Cleared table: ${table}`);
      } catch (err) {
        console.log(`Table ${table} does not exist or could not be cleared`);
      }
    }

    // Read the init.sql file
    const sqlFilePath = path.join(__dirname, '../../init.sql');
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // Remove single-line comments
    const lines = sqlContent.split('\n');
    const cleanedLines: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('--')) continue;
      if (line.trim().startsWith('SET FOREIGN_KEY_CHECKS')) {
        continue; // Skip this as we'll handle it
      }
      cleanedLines.push(line);
    }

    sqlContent = cleanedLines.join('\n');

    // Split by semicolon, handling multi-line INSERT statements
    const statements: string[] = [];
    let currentStatement = '';

    for (const line of sqlContent.split('\n')) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('--')) continue;

      currentStatement += line + '\n';

      if (trimmedLine.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`\nFound ${statements.length} SQL statements to execute`);

    // Disable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        await dataSource.query(statement);
        if ((i + 1) % 10 === 0 || i === statements.length - 1) {
          console.log(`Progress: ${i + 1}/${statements.length}`);
        }
      } catch (err: any) {
        console.error(`Error at statement ${i + 1}:`, err.message);
        console.error(`Statement:`, statement.substring(0, 150));
      }
    }

    // Re-enable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n=== Verifying imported data ===');

    const userCount = await dataSource.query('SELECT COUNT(*) as c FROM user');
    const roleCount = await dataSource.query('SELECT COUNT(*) as c FROM role');
    const permCount = await dataSource.query('SELECT COUNT(*) as c FROM permission');
    const menuCount = await dataSource.query('SELECT COUNT(*) as c FROM menu');
    const roleMenuCount = await dataSource.query('SELECT COUNT(*) as c FROM role_menu');

    console.log(`Users: ${userCount[0].c}`);
    console.log(`Roles: ${roleCount[0].c}`);
    console.log(`Permissions: ${permCount[0].c}`);
    console.log(`Menus: ${menuCount[0].c}`);
    console.log(`Role-Menu associations: ${roleMenuCount[0].c}`);

    console.log('\nSQL import completed successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('SQL import failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

cleanAndImport();
