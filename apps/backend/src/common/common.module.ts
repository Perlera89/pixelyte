import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { SupabaseService } from './services/supabase.service';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
  providers: [PrismaService, SupabaseService, LoggerService],
  exports: [PrismaService, SupabaseService, LoggerService],
})
export class CommonModule {}
