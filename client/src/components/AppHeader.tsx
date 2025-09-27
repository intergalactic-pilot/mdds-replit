import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sanitizeText } from '../logic/guards';
import { useMDDSStore } from '@/state/store';
import StrategyLog from './StrategyLog';
import { generateCardLogsPDF } from '@/utils/pdfGenerator';
import { 
  HelpCircle, 
  RotateCcw,
  Save, 
  Settings,
  Moon,
  Sun,
  Download,
  Edit,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import logoUrl from '@assets/Logo_1758524556759.png';
import { useTheme } from "./ThemeProvider";
import cardsData from '../data/cards.json';
import DomainBadge from './DomainBadge';
import { Domain } from '@shared/schema';
import QRCode from 'qrcode';

interface AppHeaderProps {
  onSave: () => void;
  onResetProgress: () => void;
  onSetMaxTurns: (turns: number) => void;
  onDownloadPDF: () => void;
}

export default function AppHeader({
  onSave,
  onResetProgress,
  onSetMaxTurns,
  onDownloadPDF
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [showCardReference, setShowCardReference] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<Domain | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Share functionality state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Use store for session management
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const strategyLog = useMDDSStore(state => state.strategyLog);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const startSession = useMDDSStore(state => state.startSession);
  const updateParticipant = useMDDSStore(state => state.updateParticipant);
  const addParticipant = useMDDSStore(state => state.addParticipant);
  const removeParticipant = useMDDSStore(state => state.removeParticipant);
  const shareSession = useMDDSStore(state => state.shareSession);

  const handleDownloadCardLogs = async () => {
    try {
      generateCardLogsPDF(strategyLog, sessionInfo);
    } catch (error) {
      console.error('Failed to generate Card Logs PDF:', error);
      alert('Failed to generate Card Logs PDF. Please try again.');
    }
  };

  const validateSessionInfo = () => {
    const errors: string[] = [];
    
    if (!sessionInfo.sessionName.trim()) {
      errors.push('Session name is required');
    }
    
    sessionInfo.participants.forEach((participant, index) => {
      if (!participant.name.trim()) {
        errors.push(`Participant ${index + 1} name is required`);
      }
      if (!participant.country.trim()) {
        errors.push(`Participant ${index + 1} country is required`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSessionSave = () => {
    if (validateSessionInfo()) {
      setShowSessionInfo(false);
      setValidationErrors([]);
    }
  };

  const handleShareSession = async () => {
    setIsSharing(true);
    try {
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
    <header className="glass-header">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="MDDS Logo" className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold" data-testid="text-app-title">
                {sanitizeText('MDDS - Multi Dimension Deterrence Strategy')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {sanitizeText('Strategic Planning Application')}
              </p>
            </div>
          </div>

          {/* Session Name */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Session:</span>
              <Input
                value={sessionInfo.sessionName}
                onChange={(e) => updateSessionName(e.target.value)}
                onBlur={() => {
                  // Auto-save when focus leaves the input
                  const saveToLocalStorage = useMDDSStore.getState().saveToLocalStorage;
                  saveToLocalStorage();
                }}
                placeholder="Enter session name"
                className="w-48 h-8 text-sm"
                disabled={sessionInfo.sessionStarted}
                data-testid="input-session-name-header"
              />
              {!sessionInfo.sessionStarted && sessionInfo.sessionName.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startSession}
                  className="h-8 px-3"
                  data-testid="button-start-session"
                >
                  Start
                </Button>
              )}
              {sessionInfo.sessionStarted && (
                <Badge variant="secondary" className="h-8 px-3 flex items-center">
                  Started
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Share Session */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareSession}
              disabled={isSharing || !sessionInfo.sessionName.trim()}
              title="Share Session"
              data-testid="button-share-session-desktop"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Session Info */}
            <Dialog open={showSessionInfo} onOpenChange={setShowSessionInfo}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-session-info">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{sanitizeText('Session Information')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="session-name">Session Name</Label>
                    <Input
                      id="session-name"
                      value={sessionInfo.sessionName}
                      onChange={(e) => updateSessionName(e.target.value)}
                      placeholder="Enter session name"
                      disabled={sessionInfo.sessionStarted}
                      data-testid="input-session-name"
                    />
                  </div>
                  
                  <div>
                    <Label>Participants</Label>
                    <div className="space-y-3 mt-2">
                      {sessionInfo.participants.map((participant, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2">
                          <Input
                            value={participant.name}
                            onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                            placeholder="Participant name"
                            data-testid={`input-participant-name-${index}`}
                          />
                          <Input
                            value={participant.country}
                            onChange={(e) => updateParticipant(index, 'country', e.target.value)}
                            placeholder="Country"
                            data-testid={`input-participant-country-${index}`}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addParticipant}
                        data-testid="button-add-participant"
                      >
                        Add Participant
                      </Button>
                      {sessionInfo.participants.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeParticipant(sessionInfo.participants.length - 1)}
                          data-testid="button-remove-participant"
                        >
                          Remove Last
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                      <div className="text-sm text-red-600 dark:text-red-400">
                        <div className="font-medium mb-1">Please fix the following errors:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowSessionInfo(false)}
                      data-testid="button-cancel-session"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSessionSave}
                      data-testid="button-save-session"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Download PDF */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDownloadPDF}
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Card Reference */}
            <Popover open={showCardReference} onOpenChange={setShowCardReference}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-show-card-reference">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-96 max-h-[70vh] overflow-y-auto" 
                align="end"
                onInteractOutside={(e) => {
                  // Prevent closing when interacting with the select dropdown
                  const target = e.target as Element;
                  if (target.closest('[data-radix-popper-content-wrapper]')) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Card Reference by Dimension</h4>
                    <Select value={selectedDimension || ''} onValueChange={(value) => setSelectedDimension(value as Domain)}>
                      <SelectTrigger data-testid="select-dimension">
                        <SelectValue placeholder="Select a dimension" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joint">Joint</SelectItem>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="cognitive">Cognitive</SelectItem>
                        <SelectItem value="space">Space</SelectItem>
                        <SelectItem value="cyber">Cyber</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedDimension && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DomainBadge domain={selectedDimension} />
                        <span className="text-sm font-medium">Cards</span>
                      </div>
                      
                      <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                        {cardsData
                          .filter((card: any) => card.domain === selectedDimension)
                          .map((card: any) => (
                            <div key={card.id} className="flex items-center gap-3 p-2 text-sm">
                              <span className="font-mono font-medium">
                                {card.id}
                              </span>
                              <span>-</span>
                              <span className="text-muted-foreground">
                                {(card.effects || []).map((effect: any, effectIndex: number) => (
                                  <span key={effectIndex}>
                                    {effectIndex > 0 ? ', ' : ''}
                                    {effect.target === 'self' ? 'Self' : 'Opponent'} {effect.domain}:{effect.delta > 0 ? '+' : ''}{effect.delta}
                                  </span>
                                ))}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Card Logs Modal */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-show-card-logs">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{sanitizeText('Card Purchase Logs')}</DialogTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadCardLogs}
                      data-testid="button-download-card-logs"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  <StrategyLog entries={strategyLog} maxHeight="60vh" />
                </div>
              </DialogContent>
            </Dialog>

            {/* Save */}
            <Button variant="ghost" size="icon" onClick={onSave} data-testid="button-save">
              <Save className="w-4 h-4" />
            </Button>

            {/* Reset Progress */}
            <Button 
              variant="outline" 
              onClick={onResetProgress}
              data-testid="button-reset-progress"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {sanitizeText('Reset Progress')}
            </Button>
          </div>
        </div>
      </div>

      {/* Share Session Dialog */}
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
                  data-testid="qr-code-image-desktop"
                />
              </div>
            )}
            
            {shareLink && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Scan the QR code or share this link:
                </p>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="text-xs"
                    data-testid="share-link-input-desktop"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant="outline"
                    data-testid="copy-link-button-desktop"
                  >
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                {linkCopied && (
                  <p className="text-xs text-green-600 text-center">
                    Link copied to clipboard!
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}