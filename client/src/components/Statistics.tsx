import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, TrendingUp, Shield, Sword } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import DefenseOffenseChart from './DefenseOffenseChart';

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
  const [activeSection, setActiveSection] = useState<'overall' | 'dimension' | 'defense' | null>(null);
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
                                  {new Date(log.timestamp).toLocaleTimeString()}
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
              
              {/* Three Square Buttons */}
              {turnStatistics.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button
                      onClick={() => setActiveSection(activeSection === 'overall' ? null : 'overall')}
                      className={`p-4 text-center font-semibold transition-all duration-300 hover-elevate ${
                        activeSection === 'overall' 
                          ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50' 
                          : 'glass-panel border border-border/50 text-muted-foreground hover:text-foreground'
                      }`}
                      style={{ borderRadius: '3px' }}
                      data-testid="button-overall-statistics"
                    >
                      <BarChart3 className="w-5 h-5 mx-auto mb-2" />
                      <div className="text-sm">Overall Statistics</div>
                    </button>
                    
                    <button
                      onClick={() => setActiveSection(activeSection === 'dimension' ? null : 'dimension')}
                      className={`p-4 text-center font-semibold transition-all duration-300 hover-elevate ${
                        activeSection === 'dimension' 
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                          : 'glass-panel border border-border/50 text-muted-foreground hover:text-foreground'
                      }`}
                      style={{ borderRadius: '3px' }}
                      data-testid="button-dimension-statistics"
                    >
                      <TrendingUp className="w-5 h-5 mx-auto mb-2" />
                      <div className="text-sm">Dimension Based Statistics</div>
                    </button>
                    
                    <button
                      onClick={() => setActiveSection(activeSection === 'defense' ? null : 'defense')}
                      className={`p-4 text-center font-semibold transition-all duration-300 hover-elevate ${
                        activeSection === 'defense' 
                          ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/50' 
                          : 'glass-panel border border-border/50 text-muted-foreground hover:text-foreground'
                      }`}
                      style={{ borderRadius: '3px' }}
                      data-testid="button-defense-offense-statistics"
                    >
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Shield className="w-4 h-4" />
                        <Sword className="w-4 h-4" />
                      </div>
                      <div className="text-sm">Defensive/Offensive Statistics Chart</div>
                    </button>
                  </div>

                  {/* Overall Statistics Content */}
                  {activeSection === 'overall' && (
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

                  {/* Dimension Based Statistics Content */}
                  {activeSection === 'dimension' && (
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

                  {/* Defensive/Offensive Statistics Chart Content */}
                  {activeSection === 'defense' && (
                    <div className="space-y-4">
                      <DefenseOffenseChart forceExpanded={true} hideToggle={true} />
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