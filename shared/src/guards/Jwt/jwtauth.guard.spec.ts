import { JwtauthGuard } from './jwtauth.guard';

describe('JwtauthGuard', () => {
  it('should be defined', () => {
    expect(new JwtauthGuard()).toBeDefined();
  });
});
