import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/services/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';

describe('UsersService - Profile Management', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            userAddress: {
              findMany: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateCurrentUser', () => {
    it('should have updateCurrentUser method', () => {
      expect(service.updateCurrentUser).toBeDefined();
      expect(typeof service.updateCurrentUser).toBe('function');
    });
  });

  describe('changePassword', () => {
    it('should have changePassword method', () => {
      expect(service.changePassword).toBeDefined();
      expect(typeof service.changePassword).toBe('function');
    });
  });

  describe('getCurrentUserAddresses', () => {
    it('should have getCurrentUserAddresses method', () => {
      expect(service.getCurrentUserAddresses).toBeDefined();
      expect(typeof service.getCurrentUserAddresses).toBe('function');
    });
  });

  describe('createCurrentUserAddress', () => {
    it('should have createCurrentUserAddress method', () => {
      expect(service.createCurrentUserAddress).toBeDefined();
      expect(typeof service.createCurrentUserAddress).toBe('function');
    });
  });

  describe('updateCurrentUserAddress', () => {
    it('should have updateCurrentUserAddress method', () => {
      expect(service.updateCurrentUserAddress).toBeDefined();
      expect(typeof service.updateCurrentUserAddress).toBe('function');
    });
  });

  describe('removeCurrentUserAddress', () => {
    it('should have removeCurrentUserAddress method', () => {
      expect(service.removeCurrentUserAddress).toBeDefined();
      expect(typeof service.removeCurrentUserAddress).toBe('function');
    });
  });
});
