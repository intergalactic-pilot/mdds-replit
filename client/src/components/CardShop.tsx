import { useState, useMemo } from 'react';
import { Card as CardType, Domain, CardType as CardTypeEnum } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CardDisplay from './CardDisplay';
import { sanitizeText } from '../logic/guards';
import { Search, Filter, ShoppingCart } from 'lucide-react';

interface CardShopProps {
  cards: CardType[];
  onAddToCart: (card: CardType) => void;
  onViewDetails: (card: CardType) => void;
  cartItems: CardType[];
  getDiscountedPrice: (card: CardType) => number;
  disabled?: boolean;
}

export default function CardShop({ 
  cards, 
  onAddToCart, 
  onViewDetails, 
  cartItems,
  getDiscountedPrice,
  disabled = false 
}: CardShopProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all');
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map(card => (
              <CardDisplay
                key={card.id}
                card={card}
                discountedPrice={getDiscountedPrice(card)}
                onAddToCart={() => onAddToCart(card)}
                onViewDetails={() => onViewDetails(card)}
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