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
  Edit
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
}

export default function AppHeader({
  currentTurn,
  maxTurns,
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
  
  // Use store for session management
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const strategyLog = useMDDSStore(state => state.strategyLog);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const updateParticipant = useMDDSStore(state => state.updateParticipant);
  const addParticipant = useMDDSStore(state => state.addParticipant);
  const removeParticipant = useMDDSStore(state => state.removeParticipant);

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

          {/* Turn Info */}
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" data-testid="badge-turn-info">
              Turn {currentTurn} of {maxTurns}
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
              <PopoverContent className="w-96 max-h-[70vh] overflow-y-auto" align="end">
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
                      
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        {cardsData
                          .filter((card: any) => card.domain === selectedDimension)
                          .map((card: any) => (
                            <div key={card.id} className="p-3 border border-border/50 rounded-md space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{card.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {card.type}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {card.baseCostK}K
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <h6 className="text-xs font-medium text-muted-foreground">Effects:</h6>
                                {(card.effects || []).map((effect: any, effectIndex: number) => (
                                  <div key={effectIndex} className="text-xs flex items-center gap-2">
                                    <Badge 
                                      variant={effect.target === 'self' ? 'default' : 'destructive'} 
                                      className="text-xs px-1 py-0"
                                    >
                                      {effect.target}
                                    </Badge>
                                    <DomainBadge domain={effect.domain} className="text-xs scale-75" />
                                    <span className={`font-mono ${
                                      effect.delta > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {effect.delta > 0 ? '+' : ''}{effect.delta}
                                    </span>
                                  </div>
                                ))}
                              </div>
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
    </header>
  );
}