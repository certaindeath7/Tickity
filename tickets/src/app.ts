import express from "express";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@zenitsu/sharedlogic";
import { createTicketRouter } from "./routes/newTicket";
import { showTicketRouter } from "./routes/showTicket";
import { indexTicketRouter } from "./routes/index";
import { updateTicketRouter } from "./routes/update";
const app = express();
// trust the traffic under the nginx proxy
// in this case was to ignore proxy's IP address
app.set("trust proxy", true);
// middleware recognize the incoming Request Object as a JSON Object
app.use(express.json());
app.use(
  express.urlencoded({
    limit: "30mb",
    extended: true,
  })
);

// attach the property session to req,
// which provides an object representing the loaded session.
// automatically add a Set-Cookie header in the response
// if the contents of req.session altered
app.use(
  cookieSession({
    signed: false,
    // it has to be true to be using HTTPS connection
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);
// if there's a route error throw using the app.use(errorHandler)
app.all("*", async (req, res, next) => {
  next(new NotFoundError());
});
app.use(errorHandler);

export { app };
