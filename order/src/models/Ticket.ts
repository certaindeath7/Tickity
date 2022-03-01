import mongoose, { version } from 'mongoose';
import { OrderStatus } from '@zenitsu/sharedlogic';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import Order from './Orders';

interface ITicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: ITicketAttrs): TicketDoc;
  findTicketEvent(event: { id: string; version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

// statics is how we add a new method to a ticket model
// this method is to perform action on entire model Ticket
ticketSchema.statics.build = (attrs: ITicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
ticketSchema.statics.findTicketEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event['id'],
    version: event['version'] - 1,
  });
};
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
// add a method to ticket document
// hoisting isReserved function
// this method is to perform on an instance of this model
ticketSchema.methods.isReserved = async function () {
  // Make sure that the ticket has not been reserved
  // find an order where the ticket is the one we just found and its status is not cancelled
  const existingOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
    },
  });
  return !!existingOrder;
};

// create a model
const Ticket = mongoose.model<TicketDoc, TicketModel>('ticket', ticketSchema);

export default Ticket;
