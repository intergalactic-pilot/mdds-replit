import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Analysis() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/database');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            data-testid="button-back-to-database"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Automatic Strategy Analysis</h1>
            <p className="text-muted-foreground">
              AI-powered analysis of your strategy sessions
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="rounded-full bg-primary/10 p-6">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                Automatic analysis of strategy sessions will be available here. 
                The system will analyze card purchases, deterrence trends, and strategic decisions 
                to provide actionable insights.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button onClick={handleBack} data-testid="button-back-analysis">
                Back to Database
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
