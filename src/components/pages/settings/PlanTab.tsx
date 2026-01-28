
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { Plan } from "./usePlan";

interface PlanTabProps {
  plans: Plan[];
  services: { id: number; name: string }[];
  currentPlans: Plan[];
  plansStartIndex: number;
  plansEndIndex: number;
  totalPlans: number;
  plansPerPage: number;
  setPlansPerPage: (value: number) => void;
  plansPage: number;
  setPlansPage: (value: number) => void;
  totalPlansPages: number;
  handleEditPlan: (plan: Plan) => void;
  setShowPlanForm: (show: boolean) => void;
}

export const PlanTab = ({
  services,
  currentPlans,
  plansStartIndex,
  plansEndIndex,
  totalPlans,
  plansPerPage,
  setPlansPerPage,
  plansPage,
  setPlansPage,
  totalPlansPages,
  handleEditPlan,
  setShowPlanForm
}: PlanTabProps) => {
  const getServiceNames = (servicesIds: number[]) => {
    return services
      .filter(service => servicesIds.includes(service.id))
      .map(service => service.name);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Planos do App</CardTitle>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowPlanForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plan.recurrence === "mensal" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {plan.recurrence === "mensal" ? "Mensal" : "Único"}
                    </span>
                  </TableCell>
                  <TableCell>R$ {plan.value.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plan.status === "Ativo" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {plan.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getServiceNames(plan.servicesIds).slice(0, 2).map((name) => (
                        <span key={name} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {name}
                        </span>
                      ))}
                      {plan.servicesIds.length > 2 && (
                        <span className="text-xs text-gray-500">+{plan.servicesIds.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{plan.creationDate}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
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
                Mostrando {plansStartIndex + 1} a {Math.min(plansEndIndex, totalPlans)} de {totalPlans} planos
              </span>
              <Select value={plansPerPage.toString()} onValueChange={(value) => {
                setPlansPerPage(Number(value));
                setPlansPage(1);
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
            
            {totalPlansPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPlansPage(Math.max(1, plansPage - 1))}
                      className={plansPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPlansPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setPlansPage(page)}
                        isActive={plansPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPlansPage(Math.min(totalPlansPages, plansPage + 1))}
                      className={plansPage === totalPlansPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
