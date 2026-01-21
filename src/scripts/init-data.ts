import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function initDatabase() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'south_admin',
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create tables
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_user (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        status INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted INT DEFAULT 0,
        deleted_at DATETIME,
        INDEX idx_username (username),
        INDEX idx_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_role (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted INT DEFAULT 0,
        deleted_at DATETIME,
        INDEX idx_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_permission (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted INT DEFAULT 0,
        deleted_at DATETIME,
        INDEX idx_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(50) NOT NULL,
        label_en VARCHAR(50) NOT NULL,
        icon VARCHAR(50),
        type INT NOT NULL COMMENT '1=directory, 2=menu, 3=button',
        router VARCHAR(255),
        rule VARCHAR(255),
        \`order\` INT DEFAULT 0,
        state INT DEFAULT 1 COMMENT '0=hidden, 1=visible',
        parent_id INT,
        permission_id BIGINT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted INT DEFAULT 0,
        deleted_at DATETIME,
        INDEX idx_parent_id (parent_id),
        INDEX idx_is_deleted (is_deleted),
        FOREIGN KEY (parent_id) REFERENCES sys_menu(id) ON DELETE SET NULL,
        FOREIGN KEY (permission_id) REFERENCES sys_permission(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_user_role (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        role_id BIGINT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE,
        UNIQUE KEY uk_user_role (user_id, role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_user_permission (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        permission_id BIGINT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES sys_permission(id) ON DELETE CASCADE,
        UNIQUE KEY uk_user_permission (user_id, permission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_role_permission (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id BIGINT NOT NULL,
        permission_id BIGINT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES sys_permission(id) ON DELETE CASCADE,
        UNIQUE KEY uk_role_permission (role_id, permission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sys_role_menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id BIGINT NOT NULL,
        menu_id INT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES sys_menu(id) ON DELETE CASCADE,
        UNIQUE KEY uk_role_menu (role_id, menu_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS content_article (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        author VARCHAR(100),
        content TEXT,
        status INT DEFAULT 1 COMMENT '1=published, 0=draft',
        created_user VARCHAR(50),
        updated_user VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted INT DEFAULT 0,
        deleted_at DATETIME,
        INDEX idx_is_deleted (is_deleted),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Insert default admin user
    const existingUser = await dataSource.query(
      'SELECT id FROM sys_user WHERE username = ?',
      ['admin'],
    );

    if (existingUser.length === 0) {
      await dataSource.query(
        'INSERT INTO sys_user (username, password, name, status) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'Administrator', 1],
      );
      console.log(
        'Default admin user created (username: admin, password: admin123)',
      );

      // Create admin role
      const roleResult = await dataSource.query(
        'INSERT INTO sys_role (name, description) VALUES (?, ?)',
        ['admin', 'Administrator role'],
      );
      const adminRoleId = roleResult.insertId;

      // Assign admin role to admin user
      const adminUser = await dataSource.query(
        'SELECT id FROM sys_user WHERE username = ?',
        ['admin'],
      );
      await dataSource.query(
        'INSERT INTO sys_user_role (user_id, role_id) VALUES (?, ?)',
        [adminUser[0].id, adminRoleId],
      );

      console.log('Admin role created and assigned to admin user');
    }

    console.log('Database initialization completed successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
