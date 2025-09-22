import { useState, useMemo } from 'react';
import { Card as CardType, Domain, CardType as CardTypeEnum } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CardDisplay from './CardDisplay';
import DomainBadge from './DomainBadge';
import { sanitizeText } from '../logic/guards';
import { formatCurrency } from '../logic/pricing';
import { Search, Filter, Info, ShoppingCart } from 'lucide-react';

// Removed card type icons and labels since we now display card ID instead

interface CardListItemProps {
  card: CardType;
  discountedPrice?: number;
  natoPrice?: number;
  russiaPrice?: number;
  onViewDetails?: () => void;
  onAddToNATOCart?: () => void;
  onAddToRussiaCart?: () => void;
  inCart?: boolean;
  disabled?: boolean;
}

function CardListItem({ 
  card, 
  discountedPrice, 
  natoPrice,
  russiaPrice,
  onViewDetails,
  onAddToNATOCart,
  onAddToRussiaCart,
  inCart = false,
  disabled = false 
}: CardListItemProps) {
  // Main price always shows base cost, team-specific prices shown on buttons

  return (
    <div 
      className={`glass-panel p-4 hover-elevate transition-all ${disabled ? 'opacity-50' : ''} ${inCart ? 'ring-2 ring-primary' : ''}`}
      data-testid={`card-${card.id}`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Card info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {card.id}
            </Badge>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate" data-testid={`text-card-name-${card.id}`}>
                {sanitizeText(card.name)}
              </h3>
              <DomainBadge domain={card.domain} className="text-xs shrink-0" />
            </div>
          </div>

          <div className="text-right">
            <div className="font-semibold" data-testid={`text-price-${card.id}`}>
              {formatCurrency(card.baseCostK)}
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetails}
            data-testid={`button-view-details-${card.id}`}
          >
            <Info className="w-3 h-3 mr-1" />
            Details
          </Button>
          
          {onAddToNATOCart && (
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs text-blue-600 font-semibold">
                {natoPrice ? formatCurrency(natoPrice) : formatCurrency(card.baseCostK)}
              </div>
              <Button
                size="sm"
                onClick={onAddToNATOCart}
                disabled={disabled || inCart}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid={`button-add-nato-${card.id}`}
              >
                NATO
              </Button>
            </div>
          )}
          
          {onAddToRussiaCart && (
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs text-red-600 font-semibold">
                {russiaPrice ? formatCurrency(russiaPrice) : formatCurrency(card.baseCostK)}
              </div>
              <Button
                size="sm"
                onClick={onAddToRussiaCart}
                disabled={disabled || inCart}
                variant="default" 
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid={`button-add-russia-${card.id}`}
              >
                Russia
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CardShopProps {
  cards: CardType[];
  onAddToCart: (card: CardType) => void;
  onViewDetails: (card: CardType) => void;
  cartItems: CardType[];
  getDiscountedPrice: (card: CardType) => number;
  getNATOPrice?: (card: CardType) => number;
  getRussiaPrice?: (card: CardType) => number;
  disabled?: boolean;
  onAddToNATOCart?: (card: CardType) => void;
  onAddToRussiaCart?: (card: CardType) => void;
}

export default function CardShop({ 
  cards, 
  onAddToCart, 
  onViewDetails, 
  cartItems,
  getDiscountedPrice,
  getNATOPrice,
  getRussiaPrice,
  disabled = false,
  onAddToNATOCart,
  onAddToRussiaCart
}: CardShopProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('economy');
  const [typeFilter, setTypeFilter] = useState<CardTypeEnum | 'all'>('all');
  const [maxCost, setMaxCost] = useState<string>('');

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Search term filter
      if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !card.id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Domain filter
      if (domainFilter !== 'all' && card.domain !== domainFilter) {
        return false;
      }

      // Type filter  
      if (typeFilter !== 'all' && card.type !== typeFilter) {
        return false;
      }

      // Cost filter
      if (maxCost && getDiscountedPrice(card) > parseInt(maxCost)) {
        return false;
      }

      return true;
    });
  }, [cards, searchTerm, domainFilter, typeFilter, maxCost, getDiscountedPrice]);

  const cartItemIds = new Set(cartItems.map(item => item.id));

  return (
    <Card data-testid="card-shop">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          {sanitizeText('Card Shop')}
          <Badge variant="outline">{filteredCards.length} cards</Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              data-testid="input-search"
            />
          </div>
          
          <Select value={domainFilter} onValueChange={(value) => setDomainFilter(value as Domain | 'all')}>
            <SelectTrigger data-testid="select-domain-filter">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="joint">Joint</SelectItem>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="cognitive">Cognitive</SelectItem>
              <SelectItem value="space">Space</SelectItem>
              <SelectItem value="cyber">Cyber</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CardTypeEnum | 'all')}>
            <SelectTrigger data-testid="select-type-filter">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
              <SelectItem value="permanent">Permanents</SelectItem>
              <SelectItem value="expert">Experts</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Max cost (K)"
            value={maxCost}
            onChange={(e) => setMaxCost(e.target.value)}
            data-testid="input-max-cost"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredCards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="w-8 h-8 mx-auto mb-2" />
            <p>No cards match your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCards.map(card => (
              <CardListItem
                key={card.id}
                card={card}
                discountedPrice={getDiscountedPrice(card)}
                natoPrice={getNATOPrice?.(card)}
                russiaPrice={getRussiaPrice?.(card)}
                onViewDetails={() => onViewDetails(card)}
                onAddToNATOCart={onAddToNATOCart ? () => onAddToNATOCart(card) : undefined}
                onAddToRussiaCart={onAddToRussiaCart ? () => onAddToRussiaCart(card) : undefined}
                inCart={cartItemIds.has(card.id)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}