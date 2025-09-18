import AppHeader from '../AppHeader';

export default function AppHeaderExample() {
  return (
    <div className="w-full">
      <AppHeader
        currentTurn={3}
        maxTurns={8}
        onNewStrategy={() => console.log('New strategy')}
        onSave={() => console.log('Save strategy')}
        onLoad={() => { console.log('Load strategy'); return true; }}
        onExport={() => { console.log('Export strategy'); return '{"turn": 3}'; }}
        onImport={(data) => { console.log('Import strategy:', data); return true; }}
        onConcludeStrategy={() => console.log('Conclude strategy')}
        onSetMaxTurns={(turns) => console.log('Set max turns:', turns)}
      />
    </div>
  );
}