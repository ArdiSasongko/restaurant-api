import { Router } from "express";
import { Middleware } from "../middleware/middleware";
import { BuyerController } from "../controller/buyerController";

class BuyerRoute {
    public router: Router

    constructor() {
        this.router = Router()
        this.getRouter()
        this.postRouter()
        this.putRouter()
        this.deleteRouter()
        this.patchRouter()
    }

    // for get request
    getRouter() {
        this.router.get('/order', Middleware.auth, BuyerController.getOrders)
        this.router.get('/history', Middleware.auth, BuyerController.getHistories)
        this.router.get('/order/:order_id', Middleware.auth, BuyerController.getOrder)
        this.router.get('/history/:history_id', Middleware.auth, BuyerController.getHistory)
    }

    // for post request
    postRouter() {
    }

    // for put request
    putRouter() {
    }

    // for delete request
    deleteRouter() {
    }

    // for patch request
    patchRouter() {
        this.router.patch('/order/:order_id/confirm', Middleware.auth, BuyerController.confirmOrder)
        this.router.patch('/order/:order_id/cancel', Middleware.auth, BuyerController.canceledOrder)
    }
}

export default new BuyerRoute().router