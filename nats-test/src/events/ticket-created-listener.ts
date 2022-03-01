// import { Message } from "node-nats-streaming";
// import { Listener } from "./base-listener";
// import { ITicketCreatedEvent } from "../../../common/src/events/ticket-created-event";
// import { Subjects } from "./subjects";
// export class TicketCretaedListener extends Listener<ITicketCreatedEvent> {
//   readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
//   queueGroupName = "orders-service-queue-group";

//   onMessage(data: ITicketCreatedEvent["data"], msg: Message) {
//     console.log("Event data: ", data);

//     msg.ack();
//   }
// }
