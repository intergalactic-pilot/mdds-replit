import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, TrendingUp } from 'lucide-react';
import { useMDDSStore } from '@/state/store';

const domainColors = {
  joint: 'text-gray-500',
  economy: 'text-green-500',
  cognitive: 'text-purple-500',
  space: 'text-blue-500',
  cyber: 'text-yellow-500'
} as const;

export default function TurnBasedLogs() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPurchaseLogsExpanded, setIsPurchaseLogsExpanded] = useState(false);
  const [isStatisticsExpanded, setIsStatisticsExpanded] = useState(false);
  const [isDomainBreakdownExpanded, setIsDomainBreakdownExpanded] = useState(false);
  const turnStatistics = useMDDSStore(state => state.turnStatistics);
  const strategyLog = useMDDSStore(state => state.strategyLog);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="glass-card border border-border/50">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 hover-elevate transition-all duration-300 text-left"
        data-testid="button-toggle-turn-logs"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Turn-based logs</h2>
          <span className="text-sm text-muted-foreground">
            ({strategyLog.filter(log => log.action.includes('purchased')).length} purchases, {turnStatistics.length} turn{turnStatistics.length !== 1 ? 's' : ''})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border/50 p-4 space-y-4" data-testid="turn-logs-content">
          {turnStatistics.length === 0 && strategyLog.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No logs available yet.</p>
          ) : (
            <div className="space-y-6">
              {/* Purchase Logs */}
              {strategyLog.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsPurchaseLogsExpanded(!isPurchaseLogsExpanded)}
                    className="w-full flex items-center justify-between p-3 glass-panel hover-elevate transition-all duration-300 text-left"
                    data-testid="button-toggle-purchase-logs"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="font-semibold">Card Purchase Logs</h3>
                      <span className="text-sm text-muted-foreground">
                        ({strategyLog.filter(log => log.action.includes('purchased')).length})
                      </span>
                    </div>
                    {isPurchaseLogsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isPurchaseLogsExpanded && (
                    <div className="max-h-60 overflow-y-auto space-y-2" data-testid="purchase-logs">
                      {strategyLog
                        .filter(log => log.action.includes('purchased'))
                        .map((log, index) => {
                          const teamColor = log.team === 'NATO' ? 'text-blue-400' : 'text-red-400';
                          
                          return (
                            <div key={index} className="glass-panel p-3 text-sm" data-testid={`purchase-log-${index}`}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold ${teamColor}`}>{log.team}</span>
                                  <span className="text-muted-foreground">Turn {log.turn}:</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {log.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                              <div className="mt-1">
                                {log.action.replace(`${log.team} purchased `, '')}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              )}
              
              {/* Deterrence Statistics Table */}
              {turnStatistics.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsStatisticsExpanded(!isStatisticsExpanded)}
                    className="w-full flex items-center justify-between p-3 glass-panel hover-elevate transition-all duration-300 text-left"
                    data-testid="button-toggle-statistics"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <h3 className="font-semibold">Deterrence Statistics</h3>
                      <span className="text-sm text-muted-foreground">
                        ({turnStatistics.length})
                      </span>
                    </div>
                    {isStatisticsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isStatisticsExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className="text-left py-2 px-1 font-medium">Turn</th>
                            <th className="text-center py-2 px-1 font-medium text-blue-400">NATO Total</th>
                            <th className="text-center py-2 px-1 font-medium text-red-400">Russia Total</th>
                            <th className="text-center py-2 px-1 font-medium text-gray-500">Joint</th>
                            <th className="text-center py-2 px-1 font-medium text-green-500">Economy</th>
                            <th className="text-center py-2 px-1 font-medium text-purple-500">Cognitive</th>
                            <th className="text-center py-2 px-1 font-medium text-blue-500">Space</th>
                            <th className="text-center py-2 px-1 font-medium text-yellow-500">Cyber</th>
                          </tr>
                        </thead>
                        <tbody>
                          {turnStatistics.map((stat, index) => {
                            return (
                              <tr key={index} className="border-b border-border/20">
                                <td className="py-2 px-1 font-medium" data-testid={`turn-${stat.turn}`}>
                                  Turn {stat.turn}
                                </td>
                                <td className="text-center py-2 px-1 text-blue-400 font-semibold" data-testid={`nato-total-${stat.turn}`}>
                                  {stat.natoTotalDeterrence}
                                </td>
                                <td className="text-center py-2 px-1 text-red-400 font-semibold" data-testid={`russia-total-${stat.turn}`}>
                                  {stat.russiaTotalDeterrence}
                                </td>
                                <td className="text-center py-2 px-1" data-testid={`joint-${stat.turn}`}>
                                  <div className="space-y-1 text-xs">
                                    <div className="text-blue-400 font-medium">{stat.natoDeterrence.joint}</div>
                                    <div className="text-red-400 font-medium">{stat.russiaDeterrence.joint}</div>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-1" data-testid={`economy-${stat.turn}`}>
                                  <div className="space-y-1 text-xs">
                                    <div className="text-blue-400 font-medium">{stat.natoDeterrence.economy}</div>
                                    <div className="text-red-400 font-medium">{stat.russiaDeterrence.economy}</div>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-1" data-testid={`cognitive-${stat.turn}`}>
                                  <div className="space-y-1 text-xs">
                                    <div className="text-blue-400 font-medium">{stat.natoDeterrence.cognitive}</div>
                                    <div className="text-red-400 font-medium">{stat.russiaDeterrence.cognitive}</div>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-1" data-testid={`space-${stat.turn}`}>
                                  <div className="space-y-1 text-xs">
                                    <div className="text-blue-400 font-medium">{stat.natoDeterrence.space}</div>
                                    <div className="text-red-400 font-medium">{stat.russiaDeterrence.space}</div>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-1" data-testid={`cyber-${stat.turn}`}>
                                  <div className="space-y-1 text-xs">
                                    <div className="text-blue-400 font-medium">{stat.natoDeterrence.cyber}</div>
                                    <div className="text-red-400 font-medium">{stat.russiaDeterrence.cyber}</div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              
              {/* Domain Breakdown for Latest Turn */}
              {turnStatistics.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsDomainBreakdownExpanded(!isDomainBreakdownExpanded)}
                    className="w-full flex items-center justify-between p-3 glass-panel hover-elevate transition-all duration-300 text-left"
                    data-testid="button-toggle-domain-breakdown"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <h3 className="font-semibold">Latest Turn Domain Breakdown</h3>
                      <span className="text-sm text-muted-foreground">
                        (5 domains)
                      </span>
                    </div>
                    {isDomainBreakdownExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isDomainBreakdownExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {Object.entries(turnStatistics[turnStatistics.length - 1].natoDeterrence).map(([domain, natoValue]) => {
                        const russiaValue = turnStatistics[turnStatistics.length - 1].russiaDeterrence[domain as keyof typeof turnStatistics[number]['russiaDeterrence']];
                        const domainAdvantage = natoValue - russiaValue;
                        
                        return (
                          <div key={domain} className="glass-panel p-3 text-center" data-testid={`domain-breakdown-${domain}`}>
                            <h4 className={`font-medium capitalize text-xs mb-2 ${domainColors[domain as keyof typeof domainColors]}`}>
                              {domain}
                            </h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-blue-400">NATO:</span>
                                <span className="font-semibold">{natoValue}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-400">Russia:</span>
                                <span className="font-semibold">{russiaValue}</span>
                              </div>
                              <div className="pt-1 border-t border-border/30">
                                <div className={`font-semibold ${
                                  domainAdvantage > 0 ? 'text-blue-400' : 
                                  domainAdvantage < 0 ? 'text-red-400' : 
                                  'text-muted-foreground'
                                }`}>
                                  {domainAdvantage > 0 ? `+${domainAdvantage}` : domainAdvantage}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}