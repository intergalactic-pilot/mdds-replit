import TeamPanel from '../TeamPanel';
import { TeamState } from '@shared/schema';

export default function TeamPanelExample() {
  const sampleNATOState: TeamState = {
    deterrence: {
      joint: 115,
      economy: 105, 
      cognitive: 90,
      space: 120,
      cyber: 95
    },
    totalDeterrence: 525,
    budget: 850,
    ownedPermanents: [
      {
        id: "J2",
        name: "Intelligence Fusion Hub", 
        domain: "joint",
        type: "permanent",
        baseCostK: 200,
        permanentMods: {
          flatDiscountK: 50,
          appliesToCardIds: ["CY3", "CG5"]
        }
      }
    ],
    expertsQueue: [
      {
        card: {
          id: "J3",
          name: "Joint Strategic Advisor",
          domain: "joint", 
          type: "expert",
          baseCostK: 100,
          expertInfo: "Provides strategic insights"
        },
        availableTurn: 3
      }
    ],
    cart: [
      {
        id: "E1",
        name: "Economic Sanctions",
        domain: "economy",
        type: "asset", 
        baseCostK: 120
      }
    ]
  };

  const sampleRussiaState: TeamState = {
    deterrence: {
      joint: 100,
      economy: 100,
      cognitive: 100, 
      space: 100,
      cyber: 100
    },
    totalDeterrence: 500,
    budget: 1000,
    ownedPermanents: [],
    expertsQueue: [],
    cart: []
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
      <TeamPanel team="NATO" teamState={sampleNATOState} isActive={true} />
      <TeamPanel team="Russia" teamState={sampleRussiaState} />
    </div>
  );
}