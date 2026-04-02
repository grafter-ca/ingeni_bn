import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Query, HttpStatus, HttpCode, ParseIntPipe, 
  BadRequestException
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserRole } from '../../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: { 
    email: string; 
    name: string; 
    password?: string;
    role?: UserRole;
    phone?: string;
    country?: string;
    image?: string;
  }) {
    if (!createUserDto.email || !createUserDto.name) {
      throw new BadRequestException('Email and Name are required');
    }

    // If password is provided, hash it and create an account record  
    createUserDto.password = createUserDto.password ? await bcrypt.hash(createUserDto.password, 10) : createUserDto.name.concat('@123'); 

    const newUser = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: newUser,
    };
  }

  @Get()
  async findAll(
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const take = limit ? parseInt(limit) : 10;
    const skip = offset ? parseInt(offset) : 0;

    const users = await this.userService.findAll(role, search, take, skip);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      meta: { total: users.length, limit: take, offset: skip },
      data: users,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    return { statusCode: HttpStatus.OK, data: user };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    const user = await this.userService.updateProfile(id, updateData);
    return { statusCode: HttpStatus.OK, message: 'Profile updated', data: user };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: 'User deleted' };
  }
}