import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as errorHandler from '../src/utility/errorHandler'
import { APIRoute } from './routes/api'
import { OrderRoute } from './routes/order'
import { UserRoute } from './routes/user'

class App {
  public app: express.Application
  public apiRoutes: APIRoute = new APIRoute()
  public userRoutes: UserRoute = new UserRoute()
  public orderRoutes: OrderRoute = new OrderRoute()
  public mongoUrl: string = 'mongodb://localhost/order-api'

  constructor() {
    this.app = express()
    this.app.use(bodyParser.json())
    this.apiRoutes.routes(this.app)
    this.userRoutes.routes(this.app)
    this.orderRoutes.routes(this.app)
    this.mongoSetup()
    this.app.use(errorHandler.logging)
    this.app.use(errorHandler.clientErrorHandler)
    this.app.use(errorHandler.errorHandler)
  }

  private mongoSetup(): void {
    mongoose.connect(this.mongoUrl, { useNewUrlParser: true })
  }
}

export default new App().app
