//todo: сделать е2е тесты для refresh-token

//example: import { INestApplication } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import * as request from 'supertest';
// import { AppModule } from '../src/app.module';

// describe('RefreshTokensController (e2e)', () => {
//   let app: INestApplication;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });

//   it('/auth/refresh-tokens (GET) - should return new accessToken', async () => {
//     // Тут можно либо подставить валидный refreshToken, либо мокнуть логику refreshTokensService
//     const refreshToken = 'valid-refresh-token-from-setup-or-mock';

//     const res = await request(app.getHttpServer())
//       .get('/auth/refresh-tokens')
//       .set('Cookie', `refreshToken=${refreshToken}`)
//       .expect(200);

//     expect(res.body).toHaveProperty('message');
//     expect(res.body).toHaveProperty('accessToken');
//     expect(typeof res.body.accessToken).toBe('string');
//     expect(res.body.accessToken.length).toBeGreaterThan(0);
//   });

//   afterAll(async () => {
//     await app.close();
//   });
// });
