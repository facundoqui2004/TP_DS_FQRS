import {
  Entity,
  Property,
  OneToOne,
  Rel,
  BeforeCreate,
  BeforeUpdate,
  Enum,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

export enum UserRole {
  METAHUMANO = 'METAHUMANO',
  BUROCRATA = 'BUROCRATA'
}

@Entity()
export class Usuario extends BaseEntity {
  @Property({ unique: true, nullable: false })
  email!: string

  @Property({ nullable: false })
  telefono!: string

  @Property({ nullable: false })
  passwordHash!: string

  @Enum(() => UserRole)
  role!: UserRole

  @Property({ default: false })
  verificado: boolean = false

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  // Relaciones One-to-One opcionales
  @OneToOne({ entity: () => 'Metahumano', mappedBy: 'usuario', nullable: true })
  metahumano?: Rel<any>

  @OneToOne({ entity: () => 'Burocrata', mappedBy: 'usuario', nullable: true })
  burocrata?: Rel<any>

  @BeforeCreate()
  @BeforeUpdate()
  validateRoleConsistency() {
    // Validar que no tenga ambos perfiles
    if (this.metahumano && this.burocrata) {
      throw new Error('Un usuario no puede tener ambos perfiles (metahumano y burocrata)')
    }
    
    // Validar que el role coincida con el perfil existente
    if (this.role === UserRole.METAHUMANO && this.burocrata) {
      throw new Error('Usuario con role METAHUMANO no puede tener perfil de burocrata')
    }
    if (this.role === UserRole.BUROCRATA && this.metahumano) {
      throw new Error('Usuario con role BUROCRATA no puede tener perfil de metahumano')
    }
  }
}