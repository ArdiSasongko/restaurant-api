import { Router } from "express";
import { UserController } from "../controller/userController";
import { profileUpload } from "../utils/cloudinary";
import { Middleware } from "../middleware/middleware";

class UserRoute {
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
        this.router.get('/resend/token', Middleware.auth, UserController.resendToken)
        this.router.get('/profile', Middleware.auth, UserController.profile)
    }

    // for post request
    postRouter() {
        this.router.post('/register', profileUpload.single('image'), UserController.registerUser)
        this.router.post('/login', UserController.login)
        this.router.post('/forget/password', UserController.forgetPassword)
    }

    // for put request
    putRouter() {
        this.router.put('/reset/password', UserController.resetPassword)
        this.router.put('/update/profile', Middleware.auth, profileUpload.single('image'), UserController.updateProfile)
    }

    // for delete request
    deleteRouter() { }

    // for patch request
    patchRouter() {
        this.router.patch("/email/verifications", Middleware.auth, UserController.emailVerified)
    }
}

export default new UserRoute().router