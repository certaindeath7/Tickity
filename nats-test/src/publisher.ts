// // publish events
// import nats from "node-nats-streaming";
// import { TicketCreatedPublisher } from "./events/ticket-created-publisher";
// console.clear();
// // client is to connect to nats streaming server
// const client = nats.connect("ticketing", "abc", {
//   url: "http://localhost:4222",
// });

// client.on("connect", async () => {
//   // need convert data to JSON first
//   const publisher = new TicketCreatedPublisher(client);
//   try {
//     await publisher.publish({
//       id: "123",
//       title: "concert",
//       price: 10,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });
