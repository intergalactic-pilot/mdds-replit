import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart3, TrendingUp, Activity, Share2, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMDDSStore } from '@/state/store';
import DeterrenceChart from '../components/DeterrenceChart';
import TurnBasedLogs from '../components/Statistics';
import DomainStatistics from '../components/DomainStatistics';
import DefenseOffenseChart from '../components/DefenseOffenseChart';

export default function Statistics() {
  const params = useParams();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);
  
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
  
  // Show loading when fetching external session data
  if (params.sessionId && sessionLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading session statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back-to-game">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold" data-testid="text-statistics-title">
                    Session Statistics & Analytics
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {sessionInfo.sessionName || 'Unnamed Session'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Turn {currentTurn} of {maxTurns}
              </div>
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  NATO: {natoTeam.totalDeterrence}
                </div>
                <div className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                  Russia: {russiaTeam.totalDeterrence}
                </div>
              </div>
              
              {/* Share Statistics Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareStatistics}
                disabled={isSharing || !sessionInfo.sessionName.trim()}
                data-testid="button-share-statistics"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {isSharing ? 'Sharing...' : 'Share Statistics'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Game Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Turn:</span>
                  <span className="font-mono">{currentTurn} / {maxTurns}</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTurn / maxTurns) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((currentTurn / maxTurns) * 100)}% Complete
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Deterrence Gap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {natoTeam.totalDeterrence - russiaTeam.totalDeterrence > 0 ? '+' : ''}
                  {natoTeam.totalDeterrence - russiaTeam.totalDeterrence}
                </div>
                <div className="text-xs text-muted-foreground">
                  {natoTeam.totalDeterrence > russiaTeam.totalDeterrence 
                    ? 'NATO Leading' 
                    : russiaTeam.totalDeterrence > natoTeam.totalDeterrence 
                      ? 'Russia Leading' 
                      : 'Tied'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total Turns Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {turnStatistics.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Statistical Data Points
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="space-y-6">
          {/* Current Deterrence Overview */}
          <DeterrenceChart 
            natoTeam={natoTeam}
            russiaTeam={russiaTeam}
          />

          {/* Defense vs Offense Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Defense vs Offense Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DefenseOffenseChart />
            </CardContent>
          </Card>

          {/* Domain Statistics Over Time */}
          <DomainStatistics />

          {/* Turn-based Logs */}
          <TurnBasedLogs />
        </div>

        {/* Session Information */}
        {sessionInfo.participants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Session Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionInfo.participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-sm text-muted-foreground">{participant.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
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