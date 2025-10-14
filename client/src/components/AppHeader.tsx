import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sanitizeText } from '../logic/guards';
import { useMDDSStore } from '@/state/store';
import StrategyLog from './StrategyLog';
import { generateCardLogsPDF } from '@/utils/pdfGenerator';
import { apiRequest } from '@/lib/queryClient';
import { 
  HelpCircle, 
  RotateCcw,
  Save, 
  Settings,
  Moon,
  Sun,
  Download,
  Users,
  Trash2,
  ChevronDown,
  Database,
  CreditCard,
  FileCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';
import logoUrl from '@assets/Logo_1758524556759.png';
import { useTheme } from "./ThemeProvider";
import cardsData from '../data/cards.json';
import DomainBadge from './DomainBadge';
import { Domain } from '@shared/schema';

interface AppHeaderProps {
  currentTurn: number;
  maxTurns: number;
  onSave: () => void;
  onResetProgress: () => void;
  onSetMaxTurns: (turns: number) => void;
  onDownloadPDF: () => void;
  onFinishGameSession: () => void;
  showShopAndCarts: boolean;
  onToggleShopAndCarts: () => void;
}

export default function AppHeader({
  currentTurn,
  maxTurns,
  onSave,
  onResetProgress,
  onSetMaxTurns,
  onDownloadPDF,
  onFinishGameSession,
  showShopAndCarts,
  onToggleShopAndCarts
}: AppHeaderProps) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [showCardReference, setShowCardReference] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<Domain | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isStrategyLogExpanded, setIsStrategyLogExpanded] = useState(false);
  const [isDatabaseUnlocked, setIsDatabaseUnlocked] = useState(false);
  const [databasePassword, setDatabasePassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  
  // Use store for session management
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const strategyLog = useMDDSStore(state => state.strategyLog);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const updateParticipant = useMDDSStore(state => state.updateParticipant);
  const addParticipant = useMDDSStore(state => state.addParticipant);
  const removeParticipant = useMDDSStore(state => state.removeParticipant);
  

  const handleUnlockDatabase = () => {
    if (databasePassword === "MDDS") {
      setIsDatabaseUnlocked(true);
      setPasswordError(false);
      setDatabasePassword("");
    } else {
      setPasswordError(true);
    }
  };

  const handleDatabaseNavigation = () => {
    setShowSettings(false);
    setLocation('/database');
  };

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
    
    sessionInfo.participants.forEach((participant, index) => {
      if (!participant.name.trim()) {
        errors.push(`Participant ${index + 1} name is required`);
      }
      if (!participant.country.trim()) {
        errors.push(`Participant ${index + 1} team is required`);
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
            <Badge variant="outline" data-testid="badge-session-name">
              {sessionInfo.sessionName || 'MDDS Session'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
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

            {/* Show/Hide Shop & Carts Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleShopAndCarts}
              data-testid="button-toggle-shop-visibility"
            >
              {showShopAndCarts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>

            {/* Participants */}
            <Dialog open={showSessionInfo} onOpenChange={setShowSessionInfo}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-participants">
                  <Users className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{sanitizeText('Participants')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Participants</Label>
                    <div className="space-y-3 mt-2">
                      {sessionInfo.participants.map((participant, index) => (
                        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                          <Input
                            value={participant.name}
                            onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                            placeholder="Participant name"
                            data-testid={`input-participant-name-${index}`}
                          />
                          <Select
                            value={participant.country}
                            onValueChange={(value) => updateParticipant(index, 'country', value)}
                          >
                            <SelectTrigger data-testid={`select-participant-team-${index}`}>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NATO">NATO</SelectItem>
                              <SelectItem value="Russia">Russia</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeParticipant(index)}
                            disabled={sessionInfo.participants.length <= 2}
                            data-testid={`button-remove-participant-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                      onClick={() => {
                        setShowSessionInfo(false);
                        setValidationErrors([]);
                      }}
                      data-testid="button-cancel-participants"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSessionSave}
                      data-testid="button-save-participants"
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
                  <DialogTitle>{sanitizeText('Settings')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Database Section - Password Protected */}
                  {!isDatabaseUnlocked ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Database (Locked)</span>
                      </div>
                      <div className="pl-3 space-y-2">
                        <Label htmlFor="database-password" className="text-sm">Enter password to unlock</Label>
                        <div className="flex gap-2">
                          <Input
                            id="database-password"
                            type="password"
                            value={databasePassword}
                            onChange={(e) => {
                              setDatabasePassword(e.target.value);
                              setPasswordError(false);
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUnlockDatabase();
                              }
                            }}
                            placeholder="Enter password"
                            className={passwordError ? "border-red-500" : ""}
                            data-testid="input-database-password"
                          />
                          <Button
                            onClick={handleUnlockDatabase}
                            size="sm"
                            data-testid="button-unlock-database"
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        </div>
                        {passwordError && (
                          <p className="text-xs text-red-500">Incorrect password</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 gap-2"
                      onClick={handleDatabaseNavigation}
                      data-testid="button-navigate-database"
                    >
                      <Database className="w-4 h-4" />
                      <span className="font-medium">Database</span>
                    </Button>
                  )}

                  {/* Card Purchase Logs */}
                  <Collapsible
                    open={isStrategyLogExpanded}
                    onOpenChange={setIsStrategyLogExpanded}
                  >
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex-1 justify-between p-3 gap-2"
                          data-testid="button-toggle-strategy-log"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="font-medium">{sanitizeText('Card Purchase Logs')}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isStrategyLogExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <Button 
                        variant="ghost"
                        size="sm" 
                        onClick={handleDownloadCardLogs}
                        data-testid="button-download-card-logs"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    <CollapsibleContent className="pt-2">
                      <StrategyLog entries={strategyLog} maxHeight="60vh" />
                    </CollapsibleContent>
                  </Collapsible>
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

            {/* Finish Session */}
            <Button 
              variant="destructive" 
              onClick={onFinishGameSession}
              data-testid="button-finish-game-session"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              {sanitizeText('Finish Session')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}