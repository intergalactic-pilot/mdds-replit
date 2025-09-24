import { useState, useMemo } from 'react';
import { Card as CardType, Domain, CardType as CardTypeEnum, TeamState } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CardDisplay from './CardDisplay';
import DomainBadge from './DomainBadge';
import { sanitizeText } from '../logic/guards';
import { formatCurrency } from '../logic/pricing';
import { isCardAvailable } from '../logic/turnEngine';
import { Search, Filter, Info, ShoppingCart } from 'lucide-react';

// Removed card type icons and labels since we now display card ID instead

interface CardListItemProps {
  card: CardType;
  natoPrice?: number;
  russiaPrice?: number;
  onViewDetails?: () => void;
  onAddToNATOCart?: () => void;
  onAddToRussiaCart?: () => void;
  inCart?: boolean;
  natoInCart?: boolean;
  russiaInCart?: boolean;
  disabled?: boolean;
  natoAvailable?: boolean;
  russiaAvailable?: boolean;
}

function CardListItem({ 
  card, 
  natoPrice,
  russiaPrice,
  onViewDetails,
  onAddToNATOCart,
  onAddToRussiaCart,
  inCart = false,
  natoInCart = false,
  russiaInCart = false,
  disabled = false,
  natoAvailable = true,
  russiaAvailable = true
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
            <div className="mb-1">
              <h3 className="font-semibold text-sm truncate" data-testid={`text-card-name-${card.id}`}>
                {sanitizeText(card.name)}
              </h3>
              <div className="mt-1">
                <DomainBadge domain={card.domain} className="text-xs" />
              </div>
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
                disabled={disabled || natoInCart || !natoAvailable}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid={`button-add-nato-${card.id}`}
                title={!natoAvailable ? "Card not available (purchased last turn)" : ""}
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
                disabled={disabled || russiaInCart || !russiaAvailable}
                variant="default" 
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid={`button-add-russia-${card.id}`}
                title={!russiaAvailable ? "Card not available (purchased last turn)" : ""}
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
  natoCartItems?: CardType[];
  russiaCartItems?: CardType[];
  getDiscountedPrice: (card: CardType) => number;
  getNATOPrice?: (card: CardType) => number;
  getRussiaPrice?: (card: CardType) => number;
  disabled?: boolean;
  onAddToNATOCart?: (card: CardType) => void;
  onAddToRussiaCart?: (card: CardType) => void;
  currentTurn?: number;
  natoTeamState?: TeamState;
  russiaTeamState?: TeamState;
}

export default function CardShop({ 
  cards, 
  onAddToCart, 
  onViewDetails, 
  cartItems,
  natoCartItems = [],
  russiaCartItems = [],
  getDiscountedPrice,
  getNATOPrice,
  getRussiaPrice,
  disabled = false,
  onAddToNATOCart,
  onAddToRussiaCart,
  currentTurn = 1,
  natoTeamState,
  russiaTeamState
}: CardShopProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('joint');
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
  const natoCartItemIds = new Set(natoCartItems.map(item => item.id));
  const russiaCartItemIds = new Set(russiaCartItems.map(item => item.id));

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
            {filteredCards.map(card => {
              // Check card availability for each team
              const natoAvailable = natoTeamState ? isCardAvailable(card.id, 'NATO', currentTurn, natoTeamState) : true;
              const russiaAvailable = russiaTeamState ? isCardAvailable(card.id, 'Russia', currentTurn, russiaTeamState) : true;
              
              return (
                <CardListItem
                  key={card.id}
                  card={card}
                  natoPrice={getNATOPrice?.(card)}
                  russiaPrice={getRussiaPrice?.(card)}
                  onViewDetails={() => onViewDetails(card)}
                  onAddToNATOCart={onAddToNATOCart ? () => onAddToNATOCart(card) : undefined}
                  onAddToRussiaCart={onAddToRussiaCart ? () => onAddToRussiaCart(card) : undefined}
                  inCart={cartItemIds.has(card.id)}
                  natoInCart={natoCartItemIds.has(card.id)}
                  russiaInCart={russiaCartItemIds.has(card.id)}
                  disabled={disabled}
                  natoAvailable={natoAvailable}
                  russiaAvailable={russiaAvailable}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}