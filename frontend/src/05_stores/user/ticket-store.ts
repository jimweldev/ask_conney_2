import { create } from 'zustand';
import type { Notification } from '@/04_types/user/notification';

type TicketStoreProps = {
  tickets: Notification[];
  page: number;
  hasNextPage: boolean;
  setTickets: (tickets: Notification[]) => void;
  appendTickets: (tickets: Notification[]) => void;
  setPage: (page: number) => void;
  setHasNextPage: (hasNextPage: boolean) => void;
};

const useTicketStore = create<TicketStoreProps>(set => ({
  tickets: [],
  page: 1,
  hasNextPage: true,

  setTickets: tickets =>
    set({
      tickets: dedupeTickets(tickets),
    }),

  appendTickets: tickets =>
    set(state => ({
      tickets: dedupeTickets([...state.tickets, ...tickets]),
    })),

  setPage: page => set({ page }),
  setHasNextPage: hasNextPage => set({ hasNextPage }),
}));

// Helper to remove duplicates by `id`
const dedupeTickets = (tickets: Notification[]) => {
  const seen = new Set<number>();
  return tickets.filter(ticket => {
    if (seen.has(ticket.id!)) return false;
    seen.add(ticket.id!);
    return true;
  });
};

export default useTicketStore;
