import { Router } from "express";
import { Middleware } from "../middleware/middleware";
import { SellerController } from "../controller/sellerController";

class SellerRoute {
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
        this.router.get('/:restaurant_id/order', Middleware.auth, Middleware.roleAccess, Middleware.access, SellerController.getOrders)
        this.router.get('/:restaurant_id/order/:order_id', Middleware.auth, Middleware.roleAccess, Middleware.access, SellerController.getOrder)
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
        this.router.patch('/:restaurant_id/order/:order_id/confirm', Middleware.auth, Middleware.roleAccess, Middleware.access, SellerController.confirmOrder)
        this.router.patch('/:restaurant_id/order/:order_id/deliver', Middleware.auth, Middleware.roleAccess, Middleware.access, SellerController.deliveredOrder)
        this.router.patch('/:restaurant_id/order/:order_id/cancel', Middleware.auth, Middleware.roleAccess, Middleware.access, SellerController.canceledOrder)
    }
}

export default new SellerRoute().router