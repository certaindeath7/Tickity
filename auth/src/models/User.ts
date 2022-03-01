import mongoose from "mongoose";

// an interface to describe the properties for User to create a record
interface IUser {
  email: string;
  password: string;
}

// an interface to describe method in a model (User model)
interface UserModel extends mongoose.Model<UserDoc> {
  // the return type is UserDoc
  build(attr: IUser): UserDoc;
}

// an interface to describe properties in a single user document
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // manage the reponse object from the server
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.statics.build = (attr: IUser) => {
  return new User(attr);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export default User;
