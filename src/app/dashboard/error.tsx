"use client"; // Komponenty błędów muszą być komponentami klienckimi

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Możesz tutaj zalogować błąd do serwisu monitorującego
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">
            Wystąpił nieoczekiwany błąd
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Coś poszło nie tak. Spróbuj odświeżyć stronę lub wrócić do panelu
            głównego.
          </p>
          <Button onClick={() => reset()}>Spróbuj ponownie</Button>
        </CardContent>
      </Card>
    </div>
  );
}
