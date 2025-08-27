import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../common/services/prisma.service';

describe('Cart Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Cart endpoints', () => {
    it('should require authentication for user cart endpoints', async () => {
      // Test GET /cart without auth
      await request(app.getHttpServer()).get('/cart').expect(401);

      // Test POST /cart/items without auth
      await request(app.getHttpServer())
        .post('/cart/items')
        .send({ variantId: 'test', quantity: 1 })
        .expect(401);

      // Test POST /cart/sync without auth
      await request(app.getHttpServer())
        .post('/cart/sync')
        .send({ items: [] })
        .expect(401);
    });

    it('should validate request body for cart operations', async () => {
      // Mock JWT token (in real tests, you'd use a proper JWT)
      const mockToken = 'Bearer mock-jwt-token';

      // Test invalid quantity
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', mockToken)
        .send({ variantId: 'test', quantity: 0 })
        .expect(400);

      // Test missing variantId
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', mockToken)
        .send({ quantity: 1 })
        .expect(400);

      // Test invalid sync data
      await request(app.getHttpServer())
        .post('/cart/sync')
        .set('Authorization', mockToken)
        .send({ items: 'invalid' })
        .expect(400);
    });
  });

  describe('Legacy cart endpoints', () => {
    it('should still work for backward compatibility', async () => {
      // Test legacy find cart endpoint
      await request(app.getHttpServer())
        .get('/cart/find-cart')
        .query({ sessionId: 'test-session' })
        .expect(200);
    });
  });
});
