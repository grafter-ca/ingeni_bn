import { IsEnum } from 'class-validator';
import { UserRole } from '../../generated/prisma/index.js';

export class UpdateRoleDto {
    
  @IsEnum(UserRole)
  role!: UserRole;
}