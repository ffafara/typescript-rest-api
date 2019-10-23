import { Document, Model, model, Schema } from 'mongoose'
import { default as Order } from '../models/order'
import { OrderStatus } from '../models/orderStatus'

export interface OrderModel extends Order, Document {}

// tslint:disable: object-literal-sort-keys
export const OrderSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  quantity: Number,
  shipDate: Date,
  status: {
    type: String,
    enum: [OrderStatus.Approved, OrderStatus.Delivered, OrderStatus.Placed],
  },
  complete: Boolean,
})
// tslint:enable: object-literal-sort-keys

export const OrderModel: Model<OrderModel> = model<OrderModel>(
  'Order',
  OrderSchema
)
