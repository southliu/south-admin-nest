import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function importSqlFile() {
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

    // Read the init.sql file
    const sqlFilePath = path.join(__dirname, '../../init.sql');
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // Remove single-line comments but preserve the SQL structure
    const lines = sqlContent.split('\n');
    const cleanedLines: string[] = [];
    let inMultiLineComment = false;

    for (const line of lines) {
      // Skip comment-only lines
      if (line.trim().startsWith('--')) continue;

      // Handle SET statements specially
      if (line.trim().startsWith('SET ')) {
        cleanedLines.push(line);
        continue;
      }

      cleanedLines.push(line);
    }

    sqlContent = cleanedLines.join('\n');

    // Split by semicolon, handling multi-line INSERT statements properly
    const statements: string[] = [];
    let currentStatement = '';

    for (const line of sqlContent.split('\n')) {
      const trimmedLine = line.trim();

      // Skip empty lines and comment-only lines
      if (!trimmedLine || trimmedLine.startsWith('--')) continue;

      currentStatement += line + '\n';

      // Check if line ends with semicolon (end of statement)
      if (trimmedLine.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0 && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.startsWith('--')) continue;

      try {
        await dataSource.query(statement);
        if ((i + 1) % 10 === 0 || i === statements.length - 1) {
          console.log(`Progress: ${i + 1}/${statements.length} statements executed`);
        }
      } catch (err: any) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
        console.error(`Statement:`, statement.substring(0, 200));
      }
    }

    console.log('\n=== Verifying imported data ===');

    // Verify the data
    const userCount = await dataSource.query('SELECT COUNT(*) as c FROM user');
    const roleCount = await dataSource.query('SELECT COUNT(*) as c FROM role');
    const permCount = await dataSource.query('SELECT COUNT(*) as c FROM permission');
    const menuCount = await dataSource.query('SELECT COUNT(*) as c FROM menu');

    console.log(`Users: ${userCount[0].c}`);
    console.log(`Roles: ${roleCount[0].c}`);
    console.log(`Permissions: ${permCount[0].c}`);
    console.log(`Menus: ${menuCount[0].c}`);

    console.log('SQL import completed!');
    await dataSource.destroy();
  } catch (error) {
    console.error('SQL import failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

importSqlFile();
