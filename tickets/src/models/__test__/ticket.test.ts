import { Ticket } from '../ticket';

it('implements "OCC" optimistic concurrency control', async () => {
  // create a ticket
  const ticket = Ticket.build({ title: 'ticket', price: 20, userId: 'blabla' });
  await ticket.save();

  // fetch the ticket twice
  const firstFetch = await Ticket.findById(ticket.id);
  const secondFetch = await Ticket.findById(ticket.id);

  // update the ticket twice
  firstFetch!.set({ price: 10 });
  secondFetch!.set({ price: 80 });

  // save first update
  await firstFetch!.save();
  // save the second update

  await expect(secondFetch!.save()).rejects.toThrow();
});

it('increments the fetched order version by one', async () => {
  const ticket = Ticket.build({ title: 'ticket', price: 20, userId: 'blabla' });
  await ticket.save();

  const firstFetch = await Ticket.findById(ticket.id);
  expect(firstFetch?.version).toEqual(0);
  firstFetch!.set({ price: 10 });

  await firstFetch!.save();

  expect(firstFetch?.version).toEqual(1);

  await firstFetch!.save();

  expect(firstFetch?.version).toEqual(2);
});
