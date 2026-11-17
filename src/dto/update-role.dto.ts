import { IsEnum } from 'class-validator';
import { UserRole } from '../../generated/prisma/client.js';

export class UpdateRoleDto {
    
  @IsEnum(UserRole)
  role!: UserRole;
}