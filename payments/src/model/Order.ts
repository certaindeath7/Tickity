import mongoose, { mongo } from 'mongoose';
import { OrderStatus } from '@zenitsu/sharedlogic';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
// list of properties when building an order
interface IOrdersAttrs {
  id: string;
  userId: string;
  status: OrderStatus;
  version: number;
  price: number;
}

// list of properties that an order has. This is the data in mongo db
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  version: number;
  price: number;
}

// list of properties an model contains, raw collection
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: IOrdersAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id; // delete _id in the mongo document
      },
    },
  }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

// declare the build function
orderSchema.statics.build = (attr: IOrdersAttrs) => {
  return new Order({
    _id: attr.id,
    userId: attr.userId,
    status: attr.status,
    price: attr.price,
    version: attr.version,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export default Order;
