import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { requestValidate } from "@zenitsu/sharedlogic";
const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  requestValidate,
  async (req: Request, res: Response) => {
    // get the request from the clien
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "users not existed" }] });
    }

    // compare saved password with user's input password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    // sign the jwt and send back the response
    // create payload for jwt.sign()
    const payload = {
      id: user._id,
      email: user.email,
    };
    // generate jwt
    const userJwt = jwt.sign(payload, process.env.JWT_KEY!, { expiresIn: "1h" });

    // store it on session object
    // redefine req.session object and add jwt property
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(user);
  }
);

export { router as signinRouter };
