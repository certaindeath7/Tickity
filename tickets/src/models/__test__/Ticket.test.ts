import Ticket from '../Tickets';

it('implements OCC - optimistic concurrency mongoose', async () => {
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: 'hello',
    price: 20,
    userId: 'sdfsdf',
  });
  // save the ticket to db
  await ticket.save();
  // make 2 seperate changes to the ticket
  const ticketInstance1 = await Ticket.findById(ticket.id);
  const ticketInstance2 = await Ticket.findById(ticket.id);

  ticketInstance1!.set({ price: 15 });
  ticketInstance2!.set({ price: 10 });

  //save the first updated ticket
  await ticketInstance1!.save();

  //save the second udpated ticket

  try {
    await ticketInstance2!.save();
  } catch (err) {
    return;
  }
});

it('increment version number after everytime the ticket is saved', async () => {
  const ticket = Ticket.build({
    title: 'hello',
    price: 20,
    userId: 'sdfsdf',
  });
  // save the ticket to db
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
});
