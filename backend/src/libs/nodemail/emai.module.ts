import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service.js';

@Global() // Makes the service universally available across all application blocks without repeating imports
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}