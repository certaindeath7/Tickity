import mongoose from 'mongoose';

// list of properties when building an order
interface IPaymentAttrs {
  id: string; // stripe id
  orderId: string;
}

// list of properties that a payment has. This is the data in mongo db
interface PaymentDoc extends mongoose.Document {
  id: string; // stripe id
  orderId: string;
}

// list of properties an model contains, raw collection
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: IPaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
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

// define the build function
paymentSchema.statics.build = (attr: IPaymentAttrs) => {
  return new Payment({
    id: attr.id,
    orderId: attr.orderId,
  });
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);
export default Payment;
