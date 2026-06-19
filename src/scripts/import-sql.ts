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

    // Remove comments
    sqlContent = sqlContent.replace(/--.*$/gm, '');
    sqlContent = sqlContent.replace(/\/\*[\s\S]*?\*\//g, '');

    // Split by semicolon, keeping track of multi-line statements
    const statements: string[] = [];
    let currentStatement = '';
    let inParentheses = 0;

    for (const char of sqlContent) {
      if (char === '(') inParentheses++;
      if (char === ')') inParentheses--;

      currentStatement += char;

      if (char === ';' && inParentheses === 0) {
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }

    // Add remaining statement if exists
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await dataSource.query(statement);
        console.log(`Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (err: any) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
        console.error(`Statement preview:`, statement.substring(0, 300) + '...');
        // Continue with next statement
      }
    }

    console.log('SQL import completed!');
    await dataSource.destroy();
  } catch (error) {
    console.error('SQL import failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

importSqlFile();
