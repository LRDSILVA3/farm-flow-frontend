
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, CreditCard } from "lucide-react";
import { BannersTab } from "./BannersTab";
import { PlanTab } from "./PlanTab";
import { BannerModal } from "./BannerModal";
import { PlanModal } from "./PlanModal";
import { useBanners } from "./useBanners";
import { usePlan } from "./usePlan";

export const AppSection = () => {
  const bannersData = useBanners();
  const planosData = usePlan();

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
          <PlanTab {...planosData} />
        </TabsContent>
      </Tabs>

      <BannerModal {...bannersData} />
      <PlanModal {...planosData} />
    </>
  );
};
