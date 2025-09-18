import TurnController from '../TurnController';

export default function TurnControllerExample() {
  const validationErrors = [
    'Economy domain must have exactly 200K (currently 150K)',
    'Space domain must have exactly 200K (currently 250K)'
  ];

  return (
    <div className="max-w-md">
      <TurnController
        currentTurn={1}
        maxTurns={8}
        currentTeam="NATO"
        phase="purchase"
        onCommitPurchases={() => console.log('Commit purchases')}
        onAdvanceTurn={() => console.log('Advance turn')}
        onUndoLastCommit={() => console.log('Undo last commit')}
        canCommit={true}
        canAdvance={false}
        validationErrors={validationErrors}
      />
    </div>
  );
}