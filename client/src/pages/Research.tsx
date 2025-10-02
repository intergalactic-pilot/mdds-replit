import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FlaskConical } from "lucide-react";

export default function Research() {
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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FlaskConical className="w-8 h-8" />
              Research
            </h1>
            <p className="text-muted-foreground">
              Research tools and advanced analysis
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Dashboard</CardTitle>
              <CardDescription>
                Advanced research and analysis tools for strategy sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Research features and tools will be available here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
