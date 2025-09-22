import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, SkipForward, Users, Target } from "lucide-react";
import { useMDDSStore } from '../state/store';
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileFooter() {
  const isMobile = useIsMobile();
  const store = useMDDSStore();
  
  if (!isMobile) return null;

  const natoState = store.teams.NATO;
  const russiaState = store.teams.Russia;
  const natoCartCount = natoState.cart.length;
  const russiaCartCount = russiaState.cart.length;

  const scrollToSection = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around p-2">
        {/* NATO Cart */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 h-auto text-blue-600"
          onClick={() => scrollToSection('[data-testid="cart-nato"]')}
          data-testid="footer-nato-cart"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4" />
            {natoCartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 p-0 flex items-center justify-center">
                {natoCartCount}
              </Badge>
            )}
          </div>
          <span className="text-xs">NATO</span>
        </Button>

        {/* Russia Cart */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 h-auto text-red-600"
          onClick={() => scrollToSection('[data-testid="cart-russia"]')}
          data-testid="footer-russia-cart"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4" />
            {russiaCartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 p-0 flex items-center justify-center">
                {russiaCartCount}
              </Badge>
            )}
          </div>
          <span className="text-xs">Russia</span>
        </Button>

        {/* Teams Status */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 h-auto"
          onClick={() => scrollToSection('.glass-panel')}
          data-testid="footer-teams"
        >
          <Users className="w-4 h-4" />
          <span className="text-xs">Teams</span>
        </Button>

        {/* Deterrence */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 h-auto"
          onClick={() => scrollToSection('[data-testid="deterrence-chart"]')}
          data-testid="footer-deterrence"
        >
          <Target className="w-4 h-4" />
          <span className="text-xs">Chart</span>
        </Button>

        {/* Finish Turn */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 h-auto"
          onClick={() => {
            store.advanceGameTurn();
            store.saveToLocalStorage();
          }}
          data-testid="footer-finish-turn"
        >
          <SkipForward className="w-4 h-4" />
          <span className="text-xs">Turn</span>
          <Badge variant="outline" className="text-xs">
            {store.turn}/{store.maxTurns}
          </Badge>
        </Button>
      </div>
    </div>
  );
}