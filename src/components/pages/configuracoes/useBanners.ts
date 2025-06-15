
import { useState, FormEvent } from "react";

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

export const useBanners = () => {
  const [banners] = useState<Banner[]>([
    {
      id: 1,
      titulo: "Promoção de Verão",
      descricao: "Desconto especial em todos os serviços",
      local: "home",
      ordem: 1,
      status: "Ativo",
      imagem: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
      dataCriacao: "15/01/2024"
    },
    {
      id: 2,
      titulo: "Novos Produtos",
      descricao: "Confira nossa linha de produtos agrícolas",
      local: "servicos",
      ordem: 2,
      status: "Ativo",
      imagem: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
      dataCriacao: "10/01/2024"
    }
  ]);

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
    console.log("Banner saved:", bannerFormData);
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
