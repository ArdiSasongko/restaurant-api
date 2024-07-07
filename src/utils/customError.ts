export class CustomError extends Error {
    data?: any
    constructor(public status_code: number, message: string, data?: any) {
        super(message);
        this.status_code = status_code;
        this.data = data
    }
}