import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn(
      "404 - Rota inexistente acessada:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/70 p-4">
      <Card className="max-w-md w-full border-slate-200/80 shadow-md text-center">
        <CardContent className="p-8 sm:p-10 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 text-green-700 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="h-8 w-8 animate-pulse" />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
            <h2 className="text-lg font-semibold text-slate-800 mt-1">Página não encontrada</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              O endereço que você tentou acessar ({location.pathname}) não existe ou foi movido no sistema Preciza.
            </p>
          </div>

          <div className="pt-2">
            <Button asChild className="bg-green-700 hover:bg-green-800 text-white shadow-sm gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
