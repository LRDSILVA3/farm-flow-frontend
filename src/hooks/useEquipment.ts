import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Equipment {
  id: string;
  name: string;
  status: string;
}

export const useEquipment = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [equipmentPerPage, setEquipmentPerPage] = useState(10);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentFormData, setEquipmentFormData] = useState<Equipment>({
    id: "",
    name: "",
    status: "Disponível"
  });

  const fetchEquipment = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar equipamentos", description: error.message, variant: "destructive" });
    } else {
      setEquipment(data?.map(e => ({
        id: e.id,
        name: e.name,
        status: e.status || "Disponível"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, [user]);

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setEquipmentFormData(item);
    setShowEquipmentForm(true);
  };

  const handleEquipmentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingEquipment) {
      const { error } = await supabase
        .from("equipment")
        .update({
          name: equipmentFormData.name,
          status: equipmentFormData.status
        })
        .eq("id", editingEquipment.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Equipamento atualizado", description: "O equipamento foi atualizado com sucesso." });
        fetchEquipment();
      }
    } else {
      const { error } = await supabase
        .from("equipment")
        .insert({
          user_id: user.id,
          name: equipmentFormData.name,
          status: equipmentFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Equipamento criado", description: "O equipamento foi criado com sucesso." });
        fetchEquipment();
      }
    }

    resetEquipmentForm();
  };

  const resetEquipmentForm = () => {
    setEquipmentFormData({
      id: "",
      name: "",
      status: "Disponível"
    });
    setEditingEquipment(null);
    setShowEquipmentForm(false);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Equipamento excluído", description: "O equipamento foi excluído com sucesso." });
      fetchEquipment();
    }
  };

  const handleEquipmentInputChange = (field: keyof Equipment, value: string) => {
    setEquipmentFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalEquipment = equipment.length;
  const totalEquipmentPages = Math.ceil(totalEquipment / equipmentPerPage);
  const equipmentStartIndex = (equipmentPage - 1) * equipmentPerPage;
  const equipmentEndIndex = equipmentStartIndex + equipmentPerPage;
  const currentEquipment = equipment.slice(equipmentStartIndex, equipmentEndIndex);

  return {
    equipment,
    loading,
    equipmentPage,
    setEquipmentPage,
    equipmentPerPage,
    setEquipmentPerPage,
    showEquipmentForm,
    setShowEquipmentForm,
    editingEquipment,
    equipmentFormData,
    handleEditEquipment,
    handleEquipmentSubmit,
    resetEquipmentForm,
    handleEquipmentInputChange,
    handleDeleteEquipment,
    totalEquipment,
    totalEquipmentPages,
    equipmentStartIndex,
    equipmentEndIndex,
    currentEquipment,
    fetchEquipment
  };
};
