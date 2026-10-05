import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import Auth from "./Auth";

const Index = () => {
  const { session, loading, refreshAuth } = useAuth();

  const handleAuthSuccess = () => {
    refreshAuth();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-green-700 text-lg">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return <MainLayout />;
};

export default Index;
