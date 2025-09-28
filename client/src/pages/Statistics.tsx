import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart3, TrendingUp, Activity, Share2, Copy, Check, Shield, Users, Target, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMDDSStore } from '@/state/store';
import { useIsMobile } from '@/hooks/use-mobile';
import DeterrenceChart from '../components/DeterrenceChart';
import TurnBasedLogs from '../components/StrategyLog';
import DomainStatistics from '../components/DomainStatistics';
import DefenseOffenseChart from '../components/DefenseOffenseChart';
import TeamDomainStatistics from '../components/TeamDomainStatistics';
import DomainBadge from '../components/DomainBadge';
import { Domain } from '@shared/schema';

type StatView = 'nato' | 'overall' | 'russia';

export default function Statistics() {
  const params = useParams();
  const isMobile = useIsMobile();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<StatView>('overall');
  
  // Share statistics state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Load session data if sessionId is in URL
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/sessions', params.sessionId],
    enabled: !!params.sessionId,
    select: (data) => data
  });
  
  // Load shared session data when available
  useEffect(() => {
    if (sessionData && params.sessionId && !sessionLoaded && loadedSessionId !== params.sessionId) {
      console.log('Loading shared session data for sessionId:', params.sessionId);
      useMDDSStore.getState().loadSharedSession(sessionData);
      setSessionLoaded(true);
      setLoadedSessionId(params.sessionId);
    }
  }, [sessionData, sessionLoaded, params.sessionId, loadedSessionId]);
  
  // Reset sessionLoaded when sessionId changes
  useEffect(() => {
    if (loadedSessionId !== params.sessionId) {
      setSessionLoaded(false);
      setLoadedSessionId(null);
    }
  }, [params.sessionId, loadedSessionId]);
  
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const natoTeam = useMDDSStore(state => state.teams.NATO);
  const russiaTeam = useMDDSStore(state => state.teams.Russia);
  const turnStatistics = useMDDSStore(state => state.turnStatistics);
  const currentTurn = useMDDSStore(state => state.turn);
  const maxTurns = useMDDSStore(state => state.maxTurns);
  const shareStatistics = useMDDSStore(state => state.shareStatistics);
  const strategyLog = useMDDSStore(state => state.strategyLog);
  
  // Handle sharing statistics
  const handleShareStatistics = async () => {
    if (!sessionInfo.sessionName.trim()) {
      alert('Please set a session name before sharing statistics.');
      return;
    }
    
    setIsSharing(true);
    setCopySuccess(false);
    
    try {
      const url = await shareStatistics();
      if (url) {
        setShareUrl(url);
        setShowShareDialog(true);
      } else {
        alert('Failed to generate shareable statistics link.');
      }
    } catch (error) {
      console.error('Error sharing statistics:', error);
      alert('Failed to generate shareable statistics link.');
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleCopyUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };
  
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];

  // NATO View Component
  const NATOView = () => (
    <div className="space-y-4 pb-20">
      {/* NATO Header Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">NATO Alliance</h2>
                <p className="text-sm text-blue-700 dark:text-blue-300">Strategic Analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{natoTeam.totalDeterrence}</div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Total Deterrence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NATO Domain Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Domain Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domains.map((domain) => (
            <div key={domain} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <DomainBadge domain={domain} />
                <span className="font-medium capitalize">{domain}</span>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {natoTeam.deterrence[domain]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* NATO Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Financial Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{natoTeam.budget}K</div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Available Budget</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{natoTeam.ownedPermanents.length}</div>
              <p className="text-sm text-green-700 dark:text-green-300">Assets Deployed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NATO Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">NATO Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamDomainStatistics team="NATO" />
        </CardContent>
      </Card>

      {/* NATO Strategy Logs */}
      <TurnBasedLogs entries={strategyLog.filter(entry => entry.team === 'NATO')} />
    </div>
  );

  // Russia View Component
  const RussiaView = () => (
    <div className="space-y-4 pb-20">
      {/* Russia Header Card */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Russian Federation</h2>
                <p className="text-sm text-red-700 dark:text-red-300">Strategic Analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{russiaTeam.totalDeterrence}</div>
              <p className="text-xs text-red-700 dark:text-red-300">Total Deterrence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Russia Domain Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Domain Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domains.map((domain) => (
            <div key={domain} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <DomainBadge domain={domain} />
                <span className="font-medium capitalize">{domain}</span>
              </div>
              <Badge variant="outline" className="text-red-600 border-red-600">
                {russiaTeam.deterrence[domain]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Russia Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Financial Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{russiaTeam.budget}K</div>
              <p className="text-sm text-red-700 dark:text-red-300">Available Budget</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{russiaTeam.ownedPermanents.length}</div>
              <p className="text-sm text-green-700 dark:text-green-300">Assets Deployed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Russia Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Russia Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamDomainStatistics team="Russia" />
        </CardContent>
      </Card>

      {/* Russia Strategy Logs */}
      <TurnBasedLogs entries={strategyLog.filter(entry => entry.team === 'Russia')} />
    </div>
  );

  // Overall Comparison View Component
  const OverallView = () => (
    <div className="space-y-4 pb-20">
      {/* Comparison Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Strategic Comparison</h2>
            <p className="text-sm text-muted-foreground">NATO vs Russia Analysis</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Deterrence Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Deterrence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium">NATO</span>
              </div>
              <div className="text-xl font-bold text-blue-600">{natoTeam.totalDeterrence}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-red-600" />
                <span className="font-medium">Russia</span>
              </div>
              <div className="text-xl font-bold text-red-600">{russiaTeam.totalDeterrence}</div>
            </div>
            
            {/* Gap Analysis */}
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Deterrence Gap</div>
              <div className="text-lg font-bold">
                {natoTeam.totalDeterrence - russiaTeam.totalDeterrence > 0 ? '+' : ''}
                {natoTeam.totalDeterrence - russiaTeam.totalDeterrence}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {natoTeam.totalDeterrence > russiaTeam.totalDeterrence 
                  ? 'NATO Leading' 
                  : russiaTeam.totalDeterrence > natoTeam.totalDeterrence 
                    ? 'Russia Leading' 
                    : 'Tied'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Domain Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domains.map((domain) => (
            <div key={domain} className="space-y-2">
              <div className="flex items-center gap-2">
                <DomainBadge domain={domain} />
                <span className="font-medium capitalize text-sm">{domain}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                  <span className="text-blue-700 dark:text-blue-300">NATO</span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">{natoTeam.deterrence[domain]}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded text-sm">
                  <span className="text-red-700 dark:text-red-300">Russia</span>
                  <span className="font-bold text-red-900 dark:text-red-100">{russiaTeam.deterrence[domain]}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Game Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Turn Progress:</span>
              <span className="font-mono">{currentTurn} / {maxTurns}</span>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentTurn / maxTurns) * 100}%` }}
              />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium">
                {Math.round((currentTurn / maxTurns) * 100)}% Complete
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deterrence Charts */}
      <DeterrenceChart 
        natoTeam={natoTeam}
        russiaTeam={russiaTeam}
      />

      {/* Defense vs Offense Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Defense vs Offense Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <DefenseOffenseChart />
        </CardContent>
      </Card>

      {/* Domain Statistics */}
      <DomainStatistics />

      {/* Complete Strategy Logs */}
      <TurnBasedLogs entries={strategyLog} />
    </div>
  );

  // Show loading when fetching external session data
  if (params.sessionId && sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading session statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back-to-game" className="hover-elevate">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-lg" data-testid="text-statistics-title">
                  Statistics
                </h1>
                <p className="text-xs text-muted-foreground">
                  {sessionInfo.sessionName || 'Unnamed Session'}
                </p>
              </div>
            </div>
            
            {/* Share Button - Desktop Only */}
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareStatistics}
                disabled={isSharing || !sessionInfo.sessionName.trim()}
                data-testid="button-share-statistics"
                className="hover-elevate"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {isSharing ? 'Sharing...' : 'Share'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {/* Render current view */}
          {currentView === 'nato' && <NATOView />}
          {currentView === 'overall' && <OverallView />}
          {currentView === 'russia' && <RussiaView />}
        </div>
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t">
        <div className="px-4 py-2">
          <div className="flex items-center justify-around">
            {/* NATO Button */}
            <Button
              variant={currentView === 'nato' ? 'default' : 'ghost'}
              className={`flex-1 flex flex-col items-center gap-1 py-3 mx-1 h-auto hover-elevate ${
                currentView === 'nato' 
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' 
                  : ''
              }`}
              onClick={() => setCurrentView('nato')}
              data-testid="button-nato-view"
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs font-medium">NATO</span>
            </Button>

            {/* Overall Button */}
            <Button
              variant={currentView === 'overall' ? 'default' : 'ghost'}
              className={`flex-1 flex flex-col items-center gap-1 py-3 mx-1 h-auto hover-elevate ${
                currentView === 'overall' 
                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100' 
                  : ''
              }`}
              onClick={() => setCurrentView('overall')}
              data-testid="button-overall-view"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">Overall</span>
            </Button>

            {/* Russia Button */}
            <Button
              variant={currentView === 'russia' ? 'default' : 'ghost'}
              className={`flex-1 flex flex-col items-center gap-1 py-3 mx-1 h-auto hover-elevate ${
                currentView === 'russia' 
                  ? 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100' 
                  : ''
              }`}
              onClick={() => setCurrentView('russia')}
              data-testid="button-russia-view"
            >
              <Target className="w-5 h-5" />
              <span className="text-xs font-medium">Russia</span>
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Share Statistics Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Session Statistics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Share2 className="w-16 h-16 text-primary" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="share-url">Statistics Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl || ''}
                  readOnly
                  className="flex-1"
                  data-testid="input-statistics-share-url"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyUrl}
                  data-testid="button-copy-statistics-url"
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copySuccess && (
                <p className="text-sm text-green-600">URL copied to clipboard!</p>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Share this link to let others view your session statistics and analytics on any device.
              </p>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="w-3 h-3" />
                  <span>Statistics include deterrence charts, domain analysis, and turn logs</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => setShowShareDialog(false)}
                variant="outline"
                data-testid="button-close-share-dialog"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}