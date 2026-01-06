import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function TooManyRequests() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 animate-fade-in">
      <Card className="max-w-md w-full shadow-lg border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Traffic Overload!
          </CardTitle>
          <CardDescription className="text-base">
            Whoa there! We're receiving too many requests from your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Please take a breather. You can try again in:
          </p>
          <div className="text-4xl font-mono font-bold tracking-widest text-primary">
            00:{countdown.toString().padStart(2, "0")}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full gap-2"
            disabled={countdown > 0}>
            <RefreshCw
              className={`h-4 w-4 ${countdown > 0 ? "animate-spin" : ""}`}
            />
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="w-full gap-2"
            variant="default">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
