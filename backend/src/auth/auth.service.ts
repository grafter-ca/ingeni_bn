import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import * as bcrypt from 'bcryptjs';
import { concat } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register(dto: any) {
    // 1. Check if user exists
    const userExists = await this.userService.findOneByEmail(dto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create User and link the Account record
    return this.userService.create({
      email: dto.email,
      name: dto.name,
      accounts: {
        create: {
          type: 'credentials',
          provider: 'email',
          providerId: dto.email,
          password: hashedPassword || dto.name+concat('@123!'), // Assuming your Account table has a password field
        },
      },
    });
  }
}