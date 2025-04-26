import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRoles } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RegisterFunctionsService {
    constructor (
        private readonly prisma: PrismaService, 
        private readonly jwt: JwtService
    ) {}

    public async hashPassword(password = ""): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    public async saveRefreshToken(userId:string, refreshToken: string) {
        await this.prisma.additionalUserData.update({
            where: {
                userId
            },
            data: {
                refresh_token: refreshToken
            }
        })
    }

    public async checkIfUserExist(username: string = "", email: string): Promise<boolean> {
        
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email }, 
                    { username }
                ]
            }
        });

        return !!user;
    }

    public async generateTokens(dto: any) {
        const accessToken = this.jwt.sign({ 
            username: dto.username, 
            email: dto.email, 
            role: dto.role || UsersRoles.USER 
        }, { 
            secret:process.env.JWT_SECRET,
            expiresIn: "1h" 
        });

        const refreshToken = this.jwt.sign({ 
            email: dto.email, 
        }, { 
            secret:process.env.JWT_SECRET,
            expiresIn: "3d" 
        });

        return { 
            accessToken,
            refreshToken
        }
    }
}
