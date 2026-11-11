
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Banner {
  id: number;
  titulo: string;
  descricao: string;
  local: "home" | "servicos";
  ordem: number;
  status: "Ativo" | "Inativo";
  imagem?: string;
  dataCriacao: string;
}

const STORAGE_KEY_BANNERS = "farm_flow_app_banners_v1";

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    titulo: "Amostragem de Solo de Precisão",
    descricao: "Planeje a próxima safra com recomendação georreferenciada Preciza",
    local: "home",
    ordem: 1,
    status: "Ativo",
    imagem: "",
    dataCriacao: "06/10/2026"
  },
  {
    id: 2,
    titulo: "Pulverização e Mapeamento com Drone",
    descricao: "Solicite orçamento direto para sua propriedade",
    local: "servicos",
    ordem: 2,
    status: "Ativo",
    imagem: "",
    dataCriacao: "06/10/2026"
  }
];

export const useBanners = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BANNERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_BANNERS;
  });

  const persistBanners = (next: Banner[]) => {
    setBanners(next);
    try {
      localStorage.setItem(STORAGE_KEY_BANNERS, JSON.stringify(next));
    } catch {}
  };

  const [bannersPage, setBannersPage] = useState(1);
  const [bannersPerPage, setBannersPerPage] = useState(10);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState<Banner>({
    id: 0,
    titulo: "",
    descricao: "",
    local: "home",
    ordem: 1,
    status: "Ativo",
    imagem: "",
    dataCriacao: ""
  });

  // Pagination calculations
  const bannersStartIndex = (bannersPage - 1) * bannersPerPage;
  const bannersEndIndex = bannersStartIndex + bannersPerPage;
  const currentBanners = banners.slice(bannersStartIndex, bannersEndIndex);
  const totalBanners = banners.length;
  const totalBannersPages = Math.ceil(totalBanners / bannersPerPage);

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData(banner);
    setShowBannerForm(true);
  };

  const handleBannerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      const updated = banners.map(b => b.id === editingBanner.id ? { ...bannerFormData, id: editingBanner.id } : b);
      persistBanners(updated);
      toast({ title: "Banner atualizado", description: "As alterações foram salvas." });
    } else {
      const created: Banner = {
        ...bannerFormData,
        id: Date.now(),
        dataCriacao: new Date().toLocaleDateString("pt-BR")
      };
      persistBanners([created, ...banners]);
      toast({ title: "Banner criado", description: "O novo banner foi cadastrado." });
    }
    resetBannerForm();
  };

  const resetBannerForm = () => {
    setShowBannerForm(false);
    setEditingBanner(null);
    setBannerFormData({
      id: 0,
      titulo: "",
      descricao: "",
      local: "home",
      ordem: 1,
      status: "Ativo",
      imagem: "",
      dataCriacao: ""
    });
  };

  const handleBannerInputChange = (field: keyof Banner, value: string | number) => {
    setBannerFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setBannerFormData(prev => ({ ...prev, imagem: imageUrl }));
  };

  return {
    banners,
    currentBanners,
    bannersStartIndex,
    bannersEndIndex,
    totalBanners,
    bannersPerPage,
    setBannersPerPage,
    bannersPage,
    setBannersPage,
    totalBannersPages,
    handleEditBanner,
    showBannerForm,
    setShowBannerForm,
    editingBanner,
    bannerFormData,
    handleBannerSubmit,
    resetBannerForm,
    handleBannerInputChange,
    handleImageUpload
  };
};
