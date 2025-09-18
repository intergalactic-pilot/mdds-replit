import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeText } from '../logic/guards';
import { 
  Shield, 
  HelpCircle, 
  RotateCcw, 
  Save, 
  Upload, 
  Download, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from "next-themes";

interface AppHeaderProps {
  currentTurn: number;
  maxTurns: number;
  onNewStrategy: () => void;
  onSave: () => void;
  onLoad: () => boolean;
  onExport: () => string;
  onImport: (data: string) => boolean;
  onConcludeStrategy: () => void;
  onSetMaxTurns: (turns: number) => void;
}

export default function AppHeader({
  currentTurn,
  maxTurns,
  onNewStrategy,
  onSave,
  onLoad,
  onExport,
  onImport,
  onConcludeStrategy,
  onSetMaxTurns
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importData, setImportData] = useState('');

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdds-strategy-turn-${currentTurn}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const success = onImport(importData);
      if (success) {
        setImportData('');
        alert('Strategy imported successfully!');
      } else {
        alert('Failed to import strategy. Please check the format.');
      }
    } catch {
      alert('Invalid JSON format.');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (onImport(content)) {
          alert('Strategy imported successfully!');
        } else {
          alert('Failed to import strategy file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="glass-header">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold" data-testid="text-app-title">
                {sanitizeText('MDDS - Multi Domain Deterrence Strategy')}
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

            {/* Rules Modal */}
            <Dialog open={showRules} onOpenChange={setShowRules}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-show-rules">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{sanitizeText('Strategy Rules & Guidelines')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold">Teams & Domains</h4>
                    <p>NATO vs Russia across 5 domains: Joint, Economy, Cognitive, Space, Cyber</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Starting Conditions</h4>
                    <p>Each team starts with 100 deterrence per domain (500 total)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Turn 1 Budget Rules</h4>
                    <p>Must spend exactly 200K per domain (1000K total split across 5 lanes)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Turn 2+ Budget Rules</h4>
                    <p>1000K pooled budget - free allocation across domains</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Card Types</h4>
                    <ul className="list-disc ml-4 space-y-1">
                      <li><strong>Assets:</strong> Immediate deterrence effects when purchased</li>
                      <li><strong>Permanents:</strong> Provide -50K discounts to specified cards</li>
                      <li><strong>Experts:</strong> Skip one turn, become available next turn (informational only)</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Settings Modal */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-show-settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{sanitizeText('Strategy Settings')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-turns">Maximum Turns</Label>
                    <Select value={maxTurns.toString()} onValueChange={(value) => onSetMaxTurns(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[4, 6, 8, 10, 12].map(turns => (
                          <SelectItem key={turns} value={turns.toString()}>
                            {turns} turns
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Save */}
            <Button variant="ghost" size="icon" onClick={onSave} data-testid="button-save">
              <Save className="w-4 h-4" />
            </Button>

            {/* Load */}
            <Button variant="ghost" size="icon" onClick={onLoad} data-testid="button-load">
              <Upload className="w-4 h-4" />
            </Button>

            {/* Export */}
            <Button variant="ghost" size="icon" onClick={handleExport} data-testid="button-export">
              <Download className="w-4 h-4" />
            </Button>

            {/* Import */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-import">
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{sanitizeText('Import Strategy')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-import">Import from file</Label>
                    <Input
                      id="file-import"
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      data-testid="input-import-file"
                    />
                  </div>
                  <div>
                    <Label htmlFor="json-import">Or paste JSON data</Label>
                    <Textarea
                      id="json-import"
                      placeholder="Paste strategy JSON here..."
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      rows={6}
                      data-testid="textarea-import-json"
                    />
                  </div>
                  <Button onClick={handleImport} disabled={!importData.trim()} data-testid="button-import-confirm">
                    {sanitizeText('Import Strategy')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* New Strategy */}
            <Button 
              variant="outline" 
              onClick={onNewStrategy}
              data-testid="button-new-strategy"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {sanitizeText('New Strategy')}
            </Button>

            {/* Conclude Strategy */}
            <Button 
              onClick={onConcludeStrategy}
              data-testid="button-conclude-strategy"
            >
              {sanitizeText('Conclude Strategy')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}