import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController - Profile Management', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateCurrentUser: jest.fn(),
            changePassword: jest.fn(),
            getCurrentUserAddresses: jest.fn(),
            createCurrentUserAddress: jest.fn(),
            updateCurrentUserAddress: jest.fn(),
            removeCurrentUserAddress: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCurrentUserProfile', () => {
    it('should have updateCurrentUserProfile method', () => {
      expect(controller.updateCurrentUserProfile).toBeDefined();
      expect(typeof controller.updateCurrentUserProfile).toBe('function');
    });
  });

  describe('changePassword', () => {
    it('should have changePassword method', () => {
      expect(controller.changePassword).toBeDefined();
      expect(typeof controller.changePassword).toBe('function');
    });
  });

  describe('getCurrentUserAddresses', () => {
    it('should have getCurrentUserAddresses method', () => {
      expect(controller.getCurrentUserAddresses).toBeDefined();
      expect(typeof controller.getCurrentUserAddresses).toBe('function');
    });
  });

  describe('createCurrentUserAddress', () => {
    it('should have createCurrentUserAddress method', () => {
      expect(controller.createCurrentUserAddress).toBeDefined();
      expect(typeof controller.createCurrentUserAddress).toBe('function');
    });
  });

  describe('updateCurrentUserAddress', () => {
    it('should have updateCurrentUserAddress method', () => {
      expect(controller.updateCurrentUserAddress).toBeDefined();
      expect(typeof controller.updateCurrentUserAddress).toBe('function');
    });
  });

  describe('removeCurrentUserAddress', () => {
    it('should have removeCurrentUserAddress method', () => {
      expect(controller.removeCurrentUserAddress).toBeDefined();
      expect(typeof controller.removeCurrentUserAddress).toBe('function');
    });
  });
});
