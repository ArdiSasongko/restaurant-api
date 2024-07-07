import express from 'express'
import { CustomError } from './utils/customError'

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
        this.app.use((error: any, req: express.Request, res: express.Response) => {
            const error_status = error instanceof CustomError ? error.status_code : 500
            const message = error.message || 'something wrong, please try again'
            const response: any = {
                status_code: error_status,
                message: message
            }

            if (error instanceof CustomError && error.data) {
                response.data = error.data
            }

            res.status(error_status).json(response)
        })
    }
}