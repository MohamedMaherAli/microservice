import mongoose from 'mongoose';

interface PaymentAttrs {
  chargeId: string;
  orderId: string;
}

interface PaymentDoc extends mongoose.Document {
  chargeId: string;
  orderId: string;
  version: number;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    chargeId: {
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
        delete ret._id;
      },
    },
  }
);
paymentSchema.set('versionKey', 'version');
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);

export { Payment };
