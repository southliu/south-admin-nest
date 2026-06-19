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
    multipleStatements: true, // Enable multiple statements
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // Read the init.sql file
    const sqlFilePath = path.join(__dirname, '../../init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('Executing SQL file...');
    try {
      await dataSource.query(sqlContent);
      console.log('SQL import completed successfully!');
    } catch (err: any) {
      console.error('Error during bulk import:', err.message);
      console.log('Attempting statement-by-statement execution...');

      // Fall back to statement-by-statement execution
      const statements = sqlContent
        .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          await dataSource.query(statement);
          if ((i + 1) % 10 === 0) {
            console.log(`Progress: ${i + 1}/${statements.length}`);
          }
        } catch (err2: any) {
          console.error(`Error at statement ${i + 1}:`, err2.message);
          console.log(`Statement preview:`, statement.substring(0, 150));
        }
      }
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('SQL import failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

importSqlFile();
