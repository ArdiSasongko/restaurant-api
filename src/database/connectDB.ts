import mongoose from "mongoose"

const url: string = Bun.env.DATABASE_URL!

export async function ConnectDB() {
    try {
        await mongoose.connect(url, {
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true
            }
        })
        await mongoose.connection.db.admin().command({ ping: 1 })
        console.log('Connected to database')
    } catch (error) {
        console.log("failed to connect database: ", error);
        await mongoose.disconnect()
    }
}