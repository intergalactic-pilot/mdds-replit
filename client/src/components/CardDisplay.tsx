import { Card as CardType } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DomainBadge from "./DomainBadge";
import { formatCurrency } from "../logic/pricing";
import { sanitizeText } from "../logic/guards";
import { ShoppingCart, Info, Zap, Clock } from "lucide-react";

interface CardDisplayProps {
  card: CardType;
  discountedPrice?: number;
  onAddToCart?: () => void;
  onViewDetails?: () => void;
  inCart?: boolean;
  disabled?: boolean;
}

const cardTypeIcons = {
  asset: <Zap className="w-4 h-4" />,
  permanent: <ShoppingCart className="w-4 h-4" />,
  expert: <Clock className="w-4 h-4" />
};

const cardTypeLabels = {
  asset: "Asset",
  permanent: "Permanent", 
  expert: "Expert"
};

export default function CardDisplay({ 
  card, 
  discountedPrice, 
  onAddToCart, 
  onViewDetails,
  inCart = false,
  disabled = false 
}: CardDisplayProps) {
  const finalPrice = discountedPrice ?? card.baseCostK;
  const hasDiscount = discountedPrice !== undefined && discountedPrice < card.baseCostK;

  return (
    <Card 
      className={`hover-elevate transition-all ${disabled ? 'opacity-50' : ''} ${inCart ? 'ring-2 ring-primary' : ''}`}
      data-testid={`card-${card.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate" data-testid={`text-card-name-${card.id}`}>
              {sanitizeText(card.name)}
            </h3>
            <p className="text-xs text-muted-foreground font-mono" data-testid={`text-card-id-${card.id}`}>
              {card.id}
            </p>
          </div>
          <DomainBadge domain={card.domain} className="text-xs shrink-0" />
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {cardTypeIcons[card.type]}
            <span className="ml-1">{sanitizeText(cardTypeLabels[card.type])}</span>
          </Badge>
          
          <div className="text-right">
            {hasDiscount && (
              <div className="text-xs text-muted-foreground line-through">
                {formatCurrency(card.baseCostK)}
              </div>
            )}
            <div className={`font-semibold ${hasDiscount ? 'text-green-600' : ''}`} data-testid={`text-price-${card.id}`}>
              {formatCurrency(finalPrice)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetails}
            className="flex-1"
            data-testid={`button-view-details-${card.id}`}
          >
            <Info className="w-3 h-3 mr-1" />
            Details
          </Button>
          
          {onAddToCart && (
            <Button
              size="sm"
              onClick={onAddToCart}
              disabled={disabled || inCart}
              className="flex-1"
              data-testid={`button-add-cart-${card.id}`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {inCart ? 'In Cart' : 'Add'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}