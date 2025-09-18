import { TeamState } from '@shared/schema';

interface DeterrenceChartProps {
  natoTeam: TeamState;
  russiaTeam: TeamState;
}

export default function DeterrenceChart({ natoTeam, russiaTeam }: DeterrenceChartProps) {
  const domains = [
    { key: 'joint' as const, label: 'Joint', color: 'bg-blue-500' },
    { key: 'economy' as const, label: 'Economy', color: 'bg-green-500' },
    { key: 'cognitive' as const, label: 'Cognitive', color: 'bg-purple-500' },
    { key: 'space' as const, label: 'Space', color: 'bg-indigo-500' },
    { key: 'cyber' as const, label: 'Cyber', color: 'bg-orange-500' }
  ];

  const maxDeterrence = Math.max(natoTeam.totalDeterrence, russiaTeam.totalDeterrence, 500);

  return (
    <div className="glass-card p-4 lg:p-6" data-testid="deterrence-chart">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center mb-2">Overall Deterrence Status</h2>
        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400" data-testid="nato-total-deterrence">
              {natoTeam.totalDeterrence}
            </div>
            <div className="text-sm text-muted-foreground">NATO</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400" data-testid="russia-total-deterrence">
              {russiaTeam.totalDeterrence}
            </div>
            <div className="text-sm text-muted-foreground">Russia</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {domains.map((domain) => {
          const natoValue = natoTeam.deterrence[domain.key];
          const russiaValue = russiaTeam.deterrence[domain.key];
          
          return (
            <div key={domain.key} className="text-center" data-testid={`domain-${domain.key}`}>
              <h3 className="font-semibold mb-3 capitalize">{domain.label}</h3>
              
              {/* NATO Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400">NATO</span>
                  <span className="font-mono" data-testid={`nato-${domain.key}-value`}>{natoValue}</span>
                </div>
                <div className="h-4 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(natoValue / 200) * 100}%` }}
                  />
                </div>
              </div>

              {/* Russia Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">Russia</span>
                  <span className="font-mono" data-testid={`russia-${domain.key}-value`}>{russiaValue}</span>
                </div>
                <div className="h-4 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(russiaValue / 200) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}