import { Router } from "express";
import { Middleware } from "../middleware/middleware";
import { bannerUpload, foodUpload } from "../utils/cloudinary";
import { RestaurantController } from "../controller/restaurantController";

class RestaurantRoute {
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
        this.router.get('/:restaurant_id', Middleware.auth, RestaurantController.getRestaurant)
        this.router.get('/:restaurant_id/menu/:menu_id', Middleware.auth, RestaurantController.getMenu)
    }

    // for post request
    postRouter() {
        this.router.post('/create', Middleware.auth, Middleware.roleAccess, bannerUpload.single('banner'), RestaurantController.create)
        this.router.post('/:restaurant_id/menu', Middleware.auth, Middleware.roleAccess, Middleware.access, foodUpload.single('image'), RestaurantController.createMenu)
    }

    // for put request
    putRouter() {
        this.router.put('/:restaurant_id', Middleware.auth, Middleware.roleAccess, Middleware.access, bannerUpload.single('banner'), RestaurantController.update)
        this.router.put('/:restaurant_id/menu/:menu_id', Middleware.auth, Middleware.roleAccess, Middleware.access, foodUpload.single('image'), RestaurantController.updateMenu)
    }

    // for delete request
    deleteRouter() {
        this.router.delete('/:restaurant_id/menu/:menu_id', Middleware.auth, Middleware.roleAccess, Middleware.access, RestaurantController.deleteMenu)
    }

    // for patch request
    patchRouter() {

    }
}

export default new RestaurantRoute().router