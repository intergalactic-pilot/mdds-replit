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
            <div 
              key={domain.key} 
              className="glass-panel p-4 text-center border border-border/50 hover-elevate transition-all duration-300" 
              data-testid={`domain-${domain.key}`}
            >
              <div className="mb-4">
                <div className={`inline-block w-3 h-3 rounded-full ${domain.color} mb-2`}></div>
                <h3 className="font-semibold text-sm capitalize">{domain.label}</h3>
              </div>
              
              {/* NATO Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400 font-medium">NATO</span>
                  <span className="font-mono font-semibold" data-testid={`nato-${domain.key}-value`}>{natoValue}</span>
                </div>
                <div className="h-3 bg-secondary/20 rounded-full overflow-hidden border border-secondary/30">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out"
                    style={{ width: `${(natoValue / 200) * 100}%` }}
                  />
                </div>
              </div>

              {/* Russia Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400 font-medium">Russia</span>
                  <span className="font-mono font-semibold" data-testid={`russia-${domain.key}-value`}>{russiaValue}</span>
                </div>
                <div className="h-3 bg-secondary/20 rounded-full overflow-hidden border border-secondary/30">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700 ease-out"
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