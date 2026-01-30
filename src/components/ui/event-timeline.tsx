import { cn } from "@/lib/utils";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  variant?: "violet" | "cyan" | "green" | "orange" | "pink";
}

interface EventTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const variantColors = {
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
};

export function EventTimeline({ events, className }: EventTimelineProps) {
  return (
    <div className={cn("relative space-y-6", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const dotColor = variantColors[event.variant || "violet"];

        return (
          <div key={index} className="relative flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={cn("h-3 w-3 rounded-full", dotColor)} />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-[var(--border)] mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="text-xs text-[var(--text-muted)] mb-1">
                {event.date}
              </div>
              <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                {event.title}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {event.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
