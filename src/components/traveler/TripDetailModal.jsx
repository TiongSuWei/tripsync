import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export default function TripDetailModal({ trip, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-semibold">{trip.title}</h2>
            <p className="text-xs text-muted-foreground">{trip.destination}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-y-auto p-5">
          {(trip.start_date || trip.travelers_count || trip.budget) && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mb-4 bg-secondary/50 rounded-xl px-4 py-3">
              {trip.start_date && <span><span className="font-medium text-foreground">Dates:</span> {trip.start_date} → {trip.end_date || '—'}</span>}
              {trip.travelers_count && <span><span className="font-medium text-foreground">Travellers:</span> {trip.travelers_count}</span>}
              {trip.budget && <span><span className="font-medium text-foreground">Budget:</span> ${Number(trip.budget).toLocaleString()}</span>}
            </div>
          )}
          {trip.itinerary ? (
            <ReactMarkdown
              className="prose prose-sm max-w-none"
              components={{
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 hover:opacity-70">{children}</a>,
                h2: ({ children }) => <h2 className="font-semibold text-base mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="font-medium text-sm mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-sm text-muted-foreground my-1.5">{children}</p>,
                li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
                ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
                strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
              }}
            >
              {trip.itinerary}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground text-sm">No itinerary content yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}