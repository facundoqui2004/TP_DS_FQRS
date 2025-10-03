import { Migration } from '@mikro-orm/migrations'

export class Migration20250808000001 extends Migration {

  async up(): Promise<void> {
    // Crear tabla Usuario
    this.addSql(`
      CREATE TABLE usuario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        telefono VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('METAHUMANO', 'BUROCRATA') NOT NULL,
        verificado BOOLEAN DEFAULT FALSE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_usuario_email (email),
        INDEX idx_usuario_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // Modificar tabla Metahumano para relación con Usuario
    this.addSql(`
      ALTER TABLE metahumano 
      ADD COLUMN usuario_id INT UNIQUE,
      ADD CONSTRAINT fk_metahumano_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) 
        ON DELETE CASCADE,
      DROP COLUMN IF EXISTS telefono,
      DROP COLUMN IF EXISTS mail;
    `)

    // Modificar tabla Burocrata para relación con Usuario  
    this.addSql(`
      ALTER TABLE burocrata 
      ADD COLUMN usuario_id INT UNIQUE,
      ADD CONSTRAINT fk_burocrata_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) 
        ON DELETE CASCADE,
      DROP COLUMN IF EXISTS telefono,
      DROP COLUMN IF EXISTS mail_buro,
      CHANGE COLUMN nombre_buro nombre VARCHAR(255) NOT NULL,
      CHANGE COLUMN alias_buro alias VARCHAR(255) NOT NULL,
      CHANGE COLUMN origen_buro origen VARCHAR(255) NOT NULL;
    `)

    // Crear índices para optimizar consultas
    this.addSql(`
      CREATE INDEX idx_metahumano_usuario ON metahumano(usuario_id);
      CREATE INDEX idx_burocrata_usuario ON burocrata(usuario_id);
    `)

    // Crear triggers para validar integridad (opcional, las validaciones están en el código)
    this.addSql(`
      DELIMITER $$
      
      CREATE TRIGGER validate_user_profile_consistency
      BEFORE UPDATE ON usuario
      FOR EACH ROW
      BEGIN
        DECLARE meta_count INT DEFAULT 0;
        DECLARE buro_count INT DEFAULT 0;
        
        SELECT COUNT(*) INTO meta_count FROM metahumano WHERE usuario_id = NEW.id;
        SELECT COUNT(*) INTO buro_count FROM burocrata WHERE usuario_id = NEW.id;
        
        -- Validar que no tenga ambos perfiles
        IF meta_count > 0 AND buro_count > 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no puede tener ambos perfiles';
        END IF;
        
        -- Validar consistencia de role
        IF NEW.role = 'METAHUMANO' AND buro_count > 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario METAHUMANO no puede tener perfil de burocrata';
        END IF;
        
        IF NEW.role = 'BUROCRATA' AND meta_count > 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario BUROCRATA no puede tener perfil de metahumano';
        END IF;
      END$$
      
      DELIMITER ;
    `)
  }

  async down(): Promise<void> {
    // Eliminar triggers
    this.addSql(`DROP TRIGGER IF EXISTS validate_user_profile_consistency;`)
    
    // Eliminar índices
    this.addSql(`DROP INDEX IF EXISTS idx_metahumano_usuario ON metahumano;`)
    this.addSql(`DROP INDEX IF EXISTS idx_burocrata_usuario ON burocrata;`)
    
    // Restaurar estructura original de Burocrata
    this.addSql(`
      ALTER TABLE burocrata 
      DROP FOREIGN KEY IF EXISTS fk_burocrata_usuario,
      DROP COLUMN IF EXISTS usuario_id,
      ADD COLUMN telefono VARCHAR(50),
      ADD COLUMN mail_buro VARCHAR(255),
      CHANGE COLUMN nombre nombre_buro VARCHAR(255) NOT NULL,
      CHANGE COLUMN alias alias_buro VARCHAR(255) NOT NULL,
      CHANGE COLUMN origen origen_buro VARCHAR(255) NOT NULL;
    `)

    // Restaurar estructura original de Metahumano
    this.addSql(`
      ALTER TABLE metahumano 
      DROP FOREIGN KEY IF EXISTS fk_metahumano_usuario,
      DROP COLUMN IF EXISTS usuario_id,
      ADD COLUMN telefono VARCHAR(50) NOT NULL,
      ADD COLUMN mail VARCHAR(255) NOT NULL;
    `)

    // Eliminar tabla Usuario
    this.addSql(`DROP TABLE IF EXISTS usuario;`)
  }
}
