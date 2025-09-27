import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Copy, Check } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import QRCode from 'qrcode';
import logoUrl from '@assets/Logo_1758524556759.png';

interface MobileSessionInputProps {
  onSessionStart: () => void;
}

export default function MobileSessionInput({ onSessionStart }: MobileSessionInputProps) {
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const startSession = useMDDSStore(state => state.startSession);
  const shareSession = useMDDSStore(state => state.shareSession);
  const [localSessionName, setLocalSessionName] = useState(sessionInfo.sessionName);
  
  // Share functionality state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleStartSession = () => {
    if (localSessionName.trim()) {
      updateSessionName(localSessionName.trim());
      startSession();
      onSessionStart();
    }
  };

  const handleShareSession = async () => {
    if (!localSessionName.trim()) {
      alert('Please enter a session name first');
      return;
    }

    setIsSharing(true);
    try {
      // Update session name but don't start session yet - this allows the QR dialog to show
      updateSessionName(localSessionName.trim());
      
      // Create shareable session
      const sessionId = await shareSession();
      if (sessionId) {
        const link = `${window.location.origin}/session/${sessionId}`;
        setShareLink(link);
        
        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(link, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrCodeUrl);
        
        // Only show dialog after successful share and QR generation
        setShowShareDialog(true);
      } else {
        alert('Failed to create shareable link');
      }
    } catch (error) {
      console.error('Error sharing session:', error);
      alert('Failed to create shareable link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoUrl} alt="MDDS Logo" className="w-16 h-16" />
          </div>
          <CardTitle className="text-xl">Multi Dimension Deterrence Strategy</CardTitle>
          <CardDescription>Enter your session name to begin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={localSessionName}
              onChange={(e) => setLocalSessionName(e.target.value)}
              placeholder="Enter session name"
              className="text-center"
              data-testid="input-mobile-session-name"
            />
          </div>
          <div className="space-y-2">
            <Button 
              onClick={handleStartSession}
              className="w-full"
              disabled={!localSessionName.trim()}
              data-testid="button-mobile-start-session"
            >
              Start Session
            </Button>
            
            <Button 
              onClick={handleShareSession}
              variant="outline"
              className="w-full"
              disabled={!localSessionName.trim() || isSharing}
              data-testid="button-share-session"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isSharing ? 'Creating Link...' : 'Share Session'}
            </Button>
            
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {qrCodeDataUrl && (
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Session QR Code" 
                        className="w-48 h-48"
                        data-testid="qr-code-image"
                      />
                    </div>
                  )}
                  
                  {shareLink && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">
                        Scan the QR code or share this link:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={shareLink}
                          readOnly
                          className="text-xs"
                          data-testid="share-link-input"
                        />
                        <Button
                          onClick={handleCopyLink}
                          size="sm"
                          variant="outline"
                          data-testid="copy-link-button"
                        >
                          {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      {linkCopied && (
                        <p className="text-xs text-green-600 text-center">
                          Link copied to clipboard!
                        </p>
                      )}
                      <Button
                        onClick={() => {
                          setShowShareDialog(false);
                          startSession();
                          onSessionStart();
                        }}
                        className="w-full"
                        data-testid="button-continue-session"
                      >
                        Continue to Session
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}