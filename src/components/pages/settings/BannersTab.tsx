
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { Banner } from "./useBanners";

interface BannersTabProps {
  banners: Banner[];
  currentBanners: Banner[];
  bannersStartIndex: number;
  bannersEndIndex: number;
  totalBanners: number;
  bannersPerPage: number;
  setBannersPerPage: (value: number) => void;
  bannersPage: number;
  setBannersPage: (value: number) => void;
  totalBannersPages: number;
  handleEditBanner: (banner: Banner) => void;
  setShowBannerForm: (show: boolean) => void;
}

export const BannersTab = ({
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
  setShowBannerForm
}: BannersTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Banners do App</CardTitle>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowBannerForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    {banner.imagem ? (
                      <img 
                        src={banner.imagem} 
                        alt={banner.titulo}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        Sem imagem
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{banner.titulo}</TableCell>
                  <TableCell className="max-w-xs truncate">{banner.descricao}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      banner.local === "home" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {banner.local === "home" ? "Home" : "Serviços"}
                    </span>
                  </TableCell>
                  <TableCell>{banner.ordem}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      banner.status === "Ativo" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {banner.status}
                    </span>
                  </TableCell>
                  <TableCell>{banner.dataCriacao}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditBanner(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Mostrando {bannersStartIndex + 1} a {Math.min(bannersEndIndex, totalBanners)} de {totalBanners} banners
              </span>
              <Select value={bannersPerPage.toString()} onValueChange={(value) => {
                setBannersPerPage(Number(value));
                setBannersPage(1);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">por página</span>
            </div>
            
            {totalBannersPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setBannersPage(Math.max(1, bannersPage - 1))}
                      className={bannersPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalBannersPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setBannersPage(page)}
                        isActive={bannersPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setBannersPage(Math.min(totalBannersPages, bannersPage + 1))}
                      className={bannersPage === totalBannersPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
