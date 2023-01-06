import mongoose, { mongo } from 'mongoose';
import { OrderStatus } from '@zenitsu/sharedlogic';
import { TicketDoc } from './Ticket';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface IOrdersAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  version: number;
  ticket: TicketDoc;
}

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
    expiresAt: {
      type: mongoose.Schema.Types.Date, // date object in Mongoose
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ticket',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);
// declare the build function
orderSchema.statics.build = (attr: IOrdersAttrs) => {
  return new Order(attr);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Orders', orderSchema);

export default Order;
