import express from 'express'
import { CustomError } from './utils/customError'
import bodyParser from 'body-parser'
import cors from 'cors'
import { ConnectDB } from './database/connectDB'
import userRoute from './route/userRoute'
import restaurantRoute from './route/restaurantRoute'
import buyerRoute from './route/buyerRoute'
import sellerRoute from './route/sellerRoute'
import { Redis } from './utils/redis'

export class Server {
    // declaration app
    public app: express.Application = express()

    constructor() {
        this.setConfig()
        this.setRoutes()
        this.setRoutesNotFound()
        this.setErrorHandler()
    }

    // config for all configuration app
    setConfig() {
        this.app.use(express.json())
        ConnectDB()
        Redis.connectRedis()
        this.app.use(cors())
        this.setBodyParser()
    }

    // set body parser
    setBodyParser() {
        this.app.use(bodyParser.urlencoded(
            {
                extended: true
            }
        ))
    }

    // config for all routes if exists
    setRoutes() {
        this.app.get("/", (req, res) => {
            res.status(200).json(
                {
                    status_code: 200,
                    message: 'Response Success'
                }
            )
        })
        // user router
        this.app.use('/api/user', userRoute)
        // restaurant router
        this.app.use('/api/restaurant', restaurantRoute)
        // buyer router
        this.app.use('/api/buyer', buyerRoute)
        // seller router
        this.app.use('/api/seller', sellerRoute)
    }

    // handler for router not exists
    setRoutesNotFound() {
        this.app.use((req: express.Request, res: express.Response) => {
            res.status(404).json(
                {
                    status_code: 404,
                    message: "route not found"
                }
            )
        })
    }

    // handler all error in app if occurs
    setErrorHandler() {
        this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            const errorStatus = error instanceof CustomError ? error.statusCode : 500
            const message = error.message || "something wrong, please try again"
            const response: any = {
                status_code: errorStatus,
                message: message
            }
            if (error instanceof CustomError && error.data) {
                response.data = error.data
            }

            res.status(errorStatus).json(response)
        })
    }
}