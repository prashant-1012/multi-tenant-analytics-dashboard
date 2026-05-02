export default function EventDrillDownPage({ params }: { params: { eventId: string } }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">Event: {params.eventId}</h2>
      <p className="text-muted-foreground">Drill-down analytics — coming in Phase 4.</p>
    </div>
  )
}
