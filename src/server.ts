import { Server } from "./app";

const server = new Server().app
const PORT = Bun.env.PORT

server.listen(PORT, () => {
    console.log(`server are running on http://localhost:${PORT}`)
})