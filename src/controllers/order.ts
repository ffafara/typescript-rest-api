import { NextFunction, Request, Response } from 'express'
import * as halson from 'halson'
import * as _ from 'lodash'
import { OrderStatus } from '../models/orderStatus'
import { OrderModel } from '../schemas/order'
import { UserModel } from '../schemas/user'
import { formatOutput } from '../utility/orderApiUtility'

export let getOrder = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id

  OrderModel.findById(id, (err, order) => {
    if (!order) {
      return res.status(404).send()
    }
    order = halson(order.toJSON()).addLink('self', `/store/orders/${order._id}`)
    return formatOutput(res, order, 200, 'order')
  })
}

export let getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const limit = Number(req.query.limit) || 0
  const offset = Number(req.query.offset) || 0

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

export let addOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.body.userId

  const user = await UserModel.findById(userId)
  if (!user) {
    return res.status(404).send()
  }

  const newOrder = new OrderModel(req.body)
  let order = await newOrder.save()

  order = halson(order.toJSON())
    .addLink('self', `/store/orders/${order._id}`)
    .addLink('user', {
      href: `/users/${order.userId}`,
    })
  return formatOutput(res, order, 201, 'order')
}

export let removeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id
  const order = await OrderModel.findById(id)

  if (!order) {
    return res.status(404).send()
  }

  await order.remove()
  return res.status(204).send()
}

export let getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = req.query.status

  const orders = await OrderModel.find({ status: status })
  const groupedOrders = _.groupBy(orders, 'userId')
  return formatOutput(res, groupedOrders, 200, 'inventory')
}
