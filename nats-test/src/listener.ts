// // listen for events
// import nats from "node-nats-streaming";
// import { randomBytes } from "crypto";
// import { TicketCretaedListener } from "./events/ticket-created-listener";
// console.clear();

// // nats client
// const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
//   url: "http://localhost:4222",
// });

// // subscription handler
// stan.on("connect", () => {
//   console.log("listener connected to NATS");

//   // clean up subscription
//   stan.on("close", () => {
//     console.log("NATS connection closed!");
//     process.exit();
//   });
//   new TicketCretaedListener(stan).listen();
// });

// process.on("SIGINT", () => stan.close()); // close the client first
// process.on("SIGTERM", () => stan.close());
