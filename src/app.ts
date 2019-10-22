import * as bodyParser from 'body-parser'
import * as express from 'express'
import { APIRoute } from './routes/api'
import { OrderRoute } from './routes/order'
import { UserRoute } from './routes/user'

class App {
  public app: express.Application
  public apiRoutes: APIRoute = new APIRoute()
  public userRoutes: UserRoute = new UserRoute()
  public orderRoutes: OrderRoute = new OrderRoute()

  constructor() {
    this.app = express()
    this.app.use(bodyParser.json())
    this.apiRoutes.routes(this.app)
    this.userRoutes.routes(this.app)
    this.orderRoutes.routes(this.app)
  }
}

export default new App().app
