
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { Banner } from "./useBanners";
import { FormEvent } from "react";

interface BannerModalProps {
  showBannerForm: boolean;
  setShowBannerForm: (show: boolean) => void;
  editingBanner: Banner | null;
  bannerFormData: Banner;
  handleBannerSubmit: (e: FormEvent) => void;
  resetBannerForm: () => void;
  handleBannerInputChange: (field: keyof Banner, value: string | number) => void;
  handleImageUpload: (imageUrl: string) => void;
}

export const BannerModal = ({
  showBannerForm,
  setShowBannerForm,
  editingBanner,
  bannerFormData,
  handleBannerSubmit,
  resetBannerForm,
  handleBannerInputChange,
  handleImageUpload
}: BannerModalProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate image upload - in production, it would be sent to a server
      const mockImageUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400";
      handleImageUpload(mockImageUrl);
    }
  };

  return (
    <Dialog open={showBannerForm} onOpenChange={setShowBannerForm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingBanner ? "Editar Banner" : "Novo Banner"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleBannerSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={bannerFormData.titulo}
              onChange={(e) => handleBannerInputChange("titulo", e.target.value)}
              placeholder="Digite o título do banner"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={bannerFormData.descricao}
              onChange={(e) => handleBannerInputChange("descricao", e.target.value)}
              placeholder="Digite a descrição do banner"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="local">Local</Label>
            <Select 
              value={bannerFormData.local} 
              onValueChange={(value: "home" | "servicos") => handleBannerInputChange("local", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ordem">Ordem</Label>
            <Input
              id="ordem"
              type="number"
              value={bannerFormData.ordem}
              onChange={(e) => handleBannerInputChange("ordem", Number(e.target.value))}
              placeholder="Ordem de exibição"
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={bannerFormData.status} 
              onValueChange={(value: "Ativo" | "Inativo") => handleBannerInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="imagem">Imagem do Banner</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="imagem"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imagem')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Imagem
                </Button>
                {bannerFormData.imagem && (
                  <span className="text-sm text-green-600">Imagem carregada</span>
                )}
              </div>
              
              {bannerFormData.imagem && (
                <div className="mt-2">
                  <img 
                    src={bannerFormData.imagem} 
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={resetBannerForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingBanner ? "Atualizar" : "Criar"} Banner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
