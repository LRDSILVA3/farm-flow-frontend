
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, CreditCard } from "lucide-react";
import { BannersTab } from "./BannersTab";
import { PlanosTab } from "./PlanosTab";
import { BannerModal } from "./BannerModal";
import { PlanoModal } from "./PlanoModal";
import { useBanners } from "./useBanners";
import { usePlanos } from "./usePlanos";

export const AppSection = () => {
  const bannersData = useBanners();
  const planosData = usePlanos();

  return (
    <>
      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">
            <Image className="h-4 w-4 mr-2" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="planos">
            <CreditCard className="h-4 w-4 mr-2" />
            Planos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banners">
          <BannersTab {...bannersData} />
        </TabsContent>

        <TabsContent value="planos">
          <PlanosTab {...planosData} />
        </TabsContent>
      </Tabs>

      <BannerModal {...bannersData} />
      <PlanoModal {...planosData} />
    </>
  );
};
