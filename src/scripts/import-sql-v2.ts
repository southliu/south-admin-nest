import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

interface InsertData {
  table: string;
  columns: string[];
  values: any[][];
}

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

    // Process INSERT statements that use subqueries
    // Replace multi-value INSERTs with individual INSERTs
    const multiInsertPattern = /INSERT INTO `?(\w+)`?\s*\(([^)]+)\)\s*VALUES\s*\((([\s\S]*?))\);?/gi;

    let matchCount = 0;
    sqlContent = sqlContent.replace(multiInsertPattern, (match, table, columns, values) => {
      matchCount++;
      const colList = columns;
      const valueRows = values.split(/\),\s*\(/);

      let result = '';
      for (const row of valueRows) {
        result += `INSERT INTO \`${table}\` (${colList}) VALUES (${row});\n`;
      }
      return result;
    });

    console.log(`Processed ${matchCount} multi-line INSERT statements`);

    // Remove comments
    sqlContent = sqlContent.replace(/--.*$/gm, '');

    // Split by semicolon
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toUpperCase().startsWith('INSERT'));

    // Also collect the INSERT statements we created
    const insertStatements = sqlContent
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.toUpperCase().startsWith('INSERT INTO') && s.endsWith(')'));

    const allStatements = [...statements, ...insertStatements];
    console.log(`Found ${allStatements.length} SQL statements to execute`);

    for (let i = 0; i < allStatements.length; i++) {
      const statement = allStatements[i];
      if (!statement) continue;

      try {
        await dataSource.query(statement);
        if (i % 10 === 0) {
          console.log(`Progress: ${i + 1}/${allStatements.length} statements executed`);
        }
      } catch (err: any) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
        // Log first 100 chars of the statement
        console.error(`Statement:`, statement.substring(0, 150) + '...');
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
