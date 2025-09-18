import StrategyLog from '../StrategyLog';

export default function StrategyLogExample() {
  const sampleEntries = [
    {
      turn: 1,
      team: 'NATO' as const,
      action: 'Strategy initiated - Turn 1 begins',
      timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
      turn: 1,
      team: 'NATO' as const,
      action: 'Committed purchases: J1 (150K), E1 (120K after discounts)',
      timestamp: new Date(Date.now() - 3 * 60 * 1000) // 3 minutes ago
    },
    {
      turn: 1,
      team: 'Russia' as const,
      action: 'Expert queued: CG3 — available next turn (informational only)',
      timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
    },
    {
      turn: 1,
      team: 'NATO' as const,
      action: 'Deterrence adjusted: NATO +15 Joint, Russia -5 Joint; Totals NATO 515, Russia 495',
      timestamp: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
    },
    {
      turn: 2,
      team: 'Russia' as const,
      action: 'Turn 2 advanced - pooled budget now available',
      timestamp: new Date() // Just now
    }
  ];

  return (
    <div className="max-w-2xl">
      <StrategyLog entries={sampleEntries} maxHeight="300px" />
    </div>
  );
}