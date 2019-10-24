import { NextFunction, Request, Response } from 'express'
import * as halson from 'halson'
import * as _ from 'lodash'
import { OrderModel } from '../schemas/order'
import { UserModel } from '../schemas/user'
import { Logger } from '../utility/logger'
import { formatOutput } from '../utility/orderApiUtility'

export let getOrder = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id

  Logger.logger.info(`[GET] [/store/orders/] ${id}`)

  OrderModel.findById(id, (err, order) => {
    if (!order) {
      Logger.logger.info(
        `[GET] [/store/orders/:{orderId}] Order ${id} not found.`
      )
      return next(new Error(`Order ${id} not found`))
    }
    order = halson(order.toJSON()).addLink('self', `/store/orders/${order._id}`)
    return formatOutput(res, order, 200, 'order')
  })
}

export let getAllOrders = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 0
  const offset = Number(req.query.offset) || 0

  Logger.logger.info(`[GET] [/store/orders/]`)

  let filteredOrders = await OrderModel.find({}, null, {
    limit: limit,
    skip: offset,
  })

  filteredOrders = filteredOrders.map(order => {
    return halson(order.toJSON())
      .addLink('self', `/store/orders/${order._id}`)
      .addLink('user', {
        href: `/users/${order.userId}`,
      })
  })

  return formatOutput(res, filteredOrders, 200, 'order')
}

export let addOrder = async (req: Request, res: Response) => {
  const userId = req.body.userId

  Logger.logger.info(`[POST] [/store/orders/] ${userId}`)

  const user = await UserModel.findById(userId)
  if (!user) {
    Logger.logger.info(
      `[POST] [/store/orders/] There is no user with the userId ${userId}`
    )
    throw new Error(`There is no user with the userId: ${userId}`)
  }

  const newOrder = new OrderModel(req.body)

  Logger.logger.info(`[POST] [/store/orders/] ${newOrder}`)
  let order = await newOrder.save()

  order = halson(order.toJSON())
    .addLink('self', `/store/orders/${order._id}`)
    .addLink('user', {
      href: `/users/${order.userId}`,
    })
  return formatOutput(res, order, 201, 'order')
}

export let removeOrder = async (req: Request, res: Response) => {
  const id = req.params.id

  Logger.logger.warn(`[DELETE] [/store/orders/] ${id}`)

  const order = await OrderModel.findById(id)

  if (!order) {
    Logger.logger.warn(
      `[DELETE] [/store/orders/:{orderId}] Order id ${id} not found`
    )
    return res.status(404).send()
  }

  await order.remove()
  return res.status(204).send()
}

export let getInventory = async (req: Request, res: Response) => {
  const status = req.query.status

  Logger.logger.info(`[GET] [/store/inventory/] ${status}`)

  const orders = await OrderModel.find({ status: status })
  const groupedOrders = _.groupBy(orders, 'userId')
  return formatOutput(res, groupedOrders, 200, 'inventory')
}
