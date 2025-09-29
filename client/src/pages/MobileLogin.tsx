import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, ArrowRight } from 'lucide-react';
import logoUrl from '@assets/Logo_1758524556759.png';

export default function MobileLogin() {
  const [sessionName, setSessionName] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionName.trim()) {
      setLocation(`/mobile/${encodeURIComponent(sessionName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <div className="flex items-center justify-center gap-3">
          <img src={logoUrl} alt="MDDS Logo" className="w-8 h-8" />
          <div className="text-center">
            <h1 className="text-lg font-bold">MDDS Mobile</h1>
            <p className="text-xs text-muted-foreground">Strategic Session Viewer</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Access Session</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the session name to view strategic statistics and data
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter session name"
                  data-testid="input-mobile-session-name"
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!sessionName.trim()}
                data-testid="button-access-session"
              >
                Access Session
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Badge variant="outline" className="text-xs">
                Mobile Access Portal
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Multi Dimension Deterrence Strategy
        </p>
      </footer>
    </div>
  );
}