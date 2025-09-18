import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Card as CardType } from '@shared/schema';
import { sanitizeText } from '../logic/guards';
import { formatCurrency } from '../logic/pricing';
import DomainBadge from './DomainBadge';

interface CartDisplayProps {
  team: 'NATO' | 'Russia';
  cartItems: CardType[];
  onRemoveFromCart?: (cardId: string) => void;
  getDiscountedPrice: (card: CardType) => number;
  cartTotal: number;
}

export default function CartDisplay({ 
  team, 
  cartItems, 
  onRemoveFromCart,
  getDiscountedPrice,
  cartTotal
}: CartDisplayProps) {
  const teamColor = team === 'NATO' ? 'text-blue-400' : 'text-red-400';
  const teamBgColor = team === 'NATO' ? 'bg-blue-600' : 'bg-red-600';

  return (
    <Card data-testid={`cart-${team.toLowerCase()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className={teamColor}>{team} Cart</span>
          </div>
          <Badge className={teamBgColor}>
            {cartItems.length} items
          </Badge>
        </CardTitle>
        
        {cartTotal > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className={`font-mono font-bold ${teamColor}`} data-testid={`cart-total-${team.toLowerCase()}`}>
              {formatCurrency(cartTotal)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {cartItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items in cart</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cartItems.map((card) => {
              const discountedPrice = getDiscountedPrice(card);
              const hasDiscount = discountedPrice < card.baseCostK;
              
              return (
                <div 
                  key={card.id} 
                  className="flex items-center justify-between p-2 rounded-md bg-secondary/20 hover-elevate"
                  data-testid={`cart-item-${card.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate" data-testid={`cart-item-name-${card.id}`}>
                        {sanitizeText(card.name)}
                      </h4>
                      <DomainBadge domain={card.domain} className="text-xs shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {card.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      {hasDiscount && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(card.baseCostK)}
                        </div>
                      )}
                      <div className={`font-semibold text-sm ${hasDiscount ? 'text-green-600' : ''}`}>
                        {formatCurrency(discountedPrice)}
                      </div>
                    </div>
                    
                    {onRemoveFromCart && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveFromCart(card.id)}
                        className="h-6 w-6 p-0"
                        data-testid={`button-remove-${card.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <p>Effects will be applied when you commit purchases</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}