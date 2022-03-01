import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import User from "../models/User";
import { requestValidate } from "@zenitsu/sharedlogic";
const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    // password must be at least 5 chars long
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be 4 and 20 charracters"),
  ],
  // check if there's any error from the body request validation
  requestValidate,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = User.build({ email, password });
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

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

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
