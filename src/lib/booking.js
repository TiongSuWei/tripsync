// Shared booking cancellation helpers

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// A booking can be cancelled while pending or confirmed (guide accepted,
// traveller hasn't rejected) as long as its start date has not passed.
export const isCancellable = (b) => {
  if (b.status === 'cancelled' || b.status === 'rejected' || b.status === 'completed') return false;
  if (b.traveler_decision === 'rejected_by_traveler') return false;
  if (b.status !== 'pending' && b.status !== 'accepted') return false;
  return !!b.start_date && b.start_date >= todayStr();
};