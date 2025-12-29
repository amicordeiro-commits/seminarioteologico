import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Helps diagnose "tela branca" caused by render crashes
    console.error("[ErrorBoundary] Uncaught error:", error);
    console.error("[ErrorBoundary] Component stack:", info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoAuth = () => {
    window.location.href = "/auth";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-serif font-semibold">Ops, algo falhou ao carregar</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Isso pode causar a tela branca. Tente recarregar; se continuar, volte para o login.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <Button onClick={this.handleReload} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </Button>
            <Button variant="outline" onClick={this.handleGoAuth}>
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
