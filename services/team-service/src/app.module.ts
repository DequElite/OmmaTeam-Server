import { Module } from '@nestjs/common';
import { TeamModule } from './team/team.module';
import { TeammatesModule } from './teammates/teammates.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TeamModule,
    TeammatesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AppModule {}
