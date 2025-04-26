import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtauthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

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
      const decodedUserData = jwt.verify(userToken as string, process.env.JWT_SECRET as string);
      req['user'] = decodedUserData;
      return true;
    } catch (err) {
      console.error("error at JwtauthGuard: ", err);

      throw new InternalServerErrorException('JWT verification failed');
    }
  }
}
