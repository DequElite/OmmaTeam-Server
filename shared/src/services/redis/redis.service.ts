import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Team } from 'generated/prisma';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;

    constructor(){
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT || '6379', 10);

        this.client = new Redis({
            host,
            port,
        });

        this.client.on('connect', () => {
            console.log('✅ Redis connected');
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis error:', err);
        });
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set<T>(key: string, value: T, ttl: number = 900): Promise<void> {
        await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async isExists(key:string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    async setTeam<T>(id: string, value: T): Promise<void> {
        await this.set(this.getTeamKey(id), value);
    }

    async getTeam<T>(id: string): Promise<T | null> {
        return await this.get<T>(this.getTeamKey(id));
    }

    async delTeam(id: string): Promise<void> {
        await this.del(this.getTeamKey(id));
    }

    private getTeamKey(id: string): string {
        return `team:${id}`;
    }

    onModuleDestroy() {
        this.client.disconnect();
    }
}
