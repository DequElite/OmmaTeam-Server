import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import * as jwt from "jsonwebtoken";
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class JwtauthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if(!authHeader?.startsWith('Bearer ') || !authHeader){
      throw new UnauthorizedException('No token provided');
    }

    const userToken = authHeader.split(' ')[1];

    if(!userToken){
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedUserData = jwt.verify(userToken as string, process.env.JWT_SECRET as string) as jwt.JwtPayload & { email: string };

      const user = await this.prisma.user.findUnique({
        where: { email: decodedUserData.email },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req['user'] = decodedUserData;
      return true;
    } catch (err) {
      console.error("error at JwtauthGuard: ", err);

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
