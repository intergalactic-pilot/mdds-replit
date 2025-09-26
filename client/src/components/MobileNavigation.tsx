import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale } from 'lucide-react';

export type MobileView = 'nato' | 'overall' | 'russia';

interface MobileNavigationProps {
  currentView: MobileView;
  onViewChange: (view: MobileView) => void;
}

export default function MobileNavigation({ currentView, onViewChange }: MobileNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
      <div className="flex items-center justify-around p-2">
        {/* NATO Button */}
        <Button
          variant={currentView === 'nato' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 h-auto"
          onClick={() => onViewChange('nato')}
          data-testid="mobile-nav-nato"
        >
          <div className="text-lg font-bold text-blue-600">NATO</div>
          <span className="text-xs">Scores</span>
        </Button>

        {/* Overall Button */}
        <Button
          variant={currentView === 'overall' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 h-auto"
          onClick={() => onViewChange('overall')}
          data-testid="mobile-nav-overall"
        >
          <Scale className="w-5 h-5" />
          <span className="text-xs">Compare</span>
        </Button>

        {/* Russia Button */}
        <Button
          variant={currentView === 'russia' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 h-auto"
          onClick={() => onViewChange('russia')}
          data-testid="mobile-nav-russia"
        >
          <div className="text-lg font-bold text-red-600">RUSSIA</div>
          <span className="text-xs">Scores</span>
        </Button>
      </div>
    </div>
  );
}