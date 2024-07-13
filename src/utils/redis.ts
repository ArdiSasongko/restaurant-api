import { createClient } from 'redis';

export const client = createClient({
    username: Bun.env.REDIS_USERNAME,
    password: Bun.env.REDIS_PASSWORD,
    socket: {
        host: Bun.env.REDIS_HOST,
        port: parseInt(Bun.env.REDIS_PORT!, 10),
    },
});

export class Redis {
    static async connectRedis(): Promise<void> {
        try {
            await client.connect();
            console.log('Connected to Redis');
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    static async setValue(key: string, value: string, timeExp?: number): Promise<void> {
        try {
            if (timeExp) {
                await client.set(key, value, { EX: timeExp });
            } else {
                await client.set(key, value);
            }
        } catch (error) {
            console.error(`Failed to set value for key ${key}:`, error);
            throw error;
        }
    }

    static async getValue(key: string): Promise<string | null> {
        try {
            const value = await client.get(key);
            return value;
        } catch (error) {
            console.error(`Failed to get value for key ${key}:`, error);
            throw error;
        }
    }

    static async delValue(key: string): Promise<void> {
        try {
            await client.del(key);
        } catch (error) {
            console.error(`Failed to delete key ${key}:`, error);
            throw error;
        }
    }

    static async setRefreshToken(userId: string, token: string): Promise<void> {
        const time: number = 30 * 24 * 60 * 60
        await this.setValue(`refresh_token:${userId}`, token, time)
    }

    static async getRefreshToken(userId: string): Promise<string | null> {
        return await this.getValue(`refresh_token:${userId}`);
    }

    static async delRefreshToken(userId: string): Promise<void> {
        await this.delValue(`refresh_token:${userId}`)
    }
}
