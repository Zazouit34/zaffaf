"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import { CheckSquare, Plus, Edit, Trash2, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ChecklistItem, 
  getChecklistItems, 
  addChecklistItem as addItem, 
  updateChecklistItem as updateItem, 
  deleteChecklistItem as deleteItem,
  onChecklistChange 
} from "@/lib/checklist-service";

// Status Icon Component
const StatusIcon = ({ status }: { status: string }) => {
  if (status === "completed") return <Check className="h-5 w-5 text-green-500" />;
  if (status === "in-progress") return <Clock className="h-5 w-5 text-yellow-500" />;
  return <X className="h-5 w-5 text-red-500" />;
};

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colorClass = 
    priority === "high" ? "bg-red-100 text-red-800" : 
    priority === "medium" ? "bg-yellow-100 text-yellow-800" : 
    "bg-blue-100 text-blue-800";
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
      {priority === "high" ? "Haute" : priority === "medium" ? "Moyenne" : "Basse"}
    </span>
  );
};

export default function ChecklistPage() {
  const { user } = useAuth();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemDueDate, setNewItemDueDate] = useState("");
  const [newItemPriority, setNewItemPriority] = useState<"low" | "medium" | "high">("medium");
  const [editItem, setEditItem] = useState<ChecklistItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch checklist items
  const fetchChecklistItems = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const items = await getChecklistItems();
      setChecklistItems(items);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      toast.error("Erreur lors du chargement des tâches");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new checklist item
  const handleAddChecklistItem = async () => {
    if (!user) return;
    if (!newItemTitle.trim()) {
      toast.error("Le titre de la tâche est requis");
      return;
    }
    
    try {
      const success = await addItem(
        newItemTitle,
        newItemDescription,
        newItemDueDate ? new Date(newItemDueDate) : null,
        newItemPriority
      );
      
      if (success) {
        setNewItemTitle("");
        setNewItemDescription("");
        setNewItemDueDate("");
        setNewItemPriority("medium");
        fetchChecklistItems();
      }
    } catch (error) {
      console.error("Error adding checklist item:", error);
      toast.error("Erreur lors de l'ajout de la tâche");
    }
  };

  // Update a checklist item
  const handleUpdateChecklistItem = async () => {
    if (!user || !editItem) return;
    
    try {
      const success = await updateItem(editItem.id, {
        title: editItem.title,
        description: editItem.description,
        dueDate: editItem.dueDate,
        priority: editItem.priority,
      });
      
      if (success) {
        fetchChecklistItems();
        setEditItem(null);
      }
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast.error("Erreur lors de la mise à jour de la tâche");
    }
  };

  // Update the status of a checklist item
  const handleUpdateItemStatus = async (id: string, newStatus: "todo" | "in-progress" | "completed") => {
    if (!user) return;
    
    try {
      const success = await updateItem(id, { status: newStatus });
      if (success) {
        fetchChecklistItems();
      }
    } catch (error) {
      console.error("Error updating checklist item status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Delete a checklist item
  const handleDeleteChecklistItem = async (id: string) => {
    if (!user) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;
    
    try {
      const success = await deleteItem(id);
      if (success) {
        fetchChecklistItems();
      }
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      toast.error("Erreur lors de la suppression de la tâche");
    }
  };

  // Filter items based on active tab
  const filteredItems = checklistItems.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "todo") return item.status === "todo";
    if (activeTab === "in-progress") return item.status === "in-progress";
    if (activeTab === "completed") return item.status === "completed";
    return true;
  });

  // Get counts for each status
  const todoCount = checklistItems.filter(item => item.status === "todo").length;
  const inProgressCount = checklistItems.filter(item => item.status === "in-progress").length;
  const completedCount = checklistItems.filter(item => item.status === "completed").length;

  useEffect(() => {
    if (user) {
      fetchChecklistItems();

      // Listen for changes to checklist to update the dashboard
      const unsubscribe = onChecklistChange(() => {
        fetchChecklistItems();
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <AppLayout requireAuth={true}>
      <div className="flex items-center gap-2 mb-6">
        <CheckSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold font-nunito">Liste des tâches de mariage</h1>
      </div>

      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Ajouter une nouvelle tâche</h2>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Titre de la tâche"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Description (optionnel)"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="date"
                value={newItemDueDate}
                onChange={(e) => setNewItemDueDate(e.target.value)}
                placeholder="Date limite"
              />
            </div>
            <div>
              <Select value={newItemPriority} onValueChange={(value) => setNewItemPriority(value as "low" | "medium" | "high")}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddChecklistItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="p-4 border-b">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">
                Toutes ({checklistItems.length})
              </TabsTrigger>
              <TabsTrigger value="todo">
                À faire ({todoCount})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                En cours ({inProgressCount})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Terminées ({completedCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="p-0">
            <ChecklistItems
              items={filteredItems}
              isLoading={isLoading}
              onStatusChange={handleUpdateItemStatus}
              onEdit={setEditItem}
              onDelete={handleDeleteChecklistItem}
            />
          </TabsContent>
          
          <TabsContent value="todo" className="p-0">
            <ChecklistItems
              items={filteredItems}
              isLoading={isLoading}
              onStatusChange={handleUpdateItemStatus}
              onEdit={setEditItem}
              onDelete={handleDeleteChecklistItem}
            />
          </TabsContent>
          
          <TabsContent value="in-progress" className="p-0">
            <ChecklistItems
              items={filteredItems}
              isLoading={isLoading}
              onStatusChange={handleUpdateItemStatus}
              onEdit={setEditItem}
              onDelete={handleDeleteChecklistItem}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="p-0">
            <ChecklistItems
              items={filteredItems}
              isLoading={isLoading}
              onStatusChange={handleUpdateItemStatus}
              onEdit={setEditItem}
              onDelete={handleDeleteChecklistItem}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Item Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la tâche</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  placeholder="Titre de la tâche"
                  value={editItem.title}
                  onChange={(e) => setEditItem({...editItem, title: e.target.value})}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description (optionnel)"
                  value={editItem.description}
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="date"
                    value={editItem.dueDate ? new Date(editItem.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditItem({...editItem, dueDate: e.target.value ? new Date(e.target.value) : null})}
                  />
                </div>
                <div>
                  <Select 
                    value={editItem.priority} 
                    onValueChange={(value) => setEditItem({...editItem, priority: value as "low" | "medium" | "high"})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditItem(null)}>Annuler</Button>
                <Button onClick={handleUpdateChecklistItem}>Enregistrer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}

// Checklist Items Component
function ChecklistItems({ 
  items, 
  isLoading,
  onStatusChange,
  onEdit,
  onDelete
}: { 
  items: ChecklistItem[], 
  isLoading: boolean,
  onStatusChange: (id: string, status: "todo" | "in-progress" | "completed") => void,
  onEdit: (item: ChecklistItem) => void,
  onDelete: (id: string) => void
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <CheckSquare className="h-12 w-12 mb-4" />
        <p>Aucune tâche trouvée</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {items.map((item) => (
        <div key={item.id} className="p-4 hover:bg-muted/50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                <StatusIcon status={item.status} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <PriorityBadge priority={item.priority} />
                  {item.dueDate && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      Échéance: {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Select 
                value={item.status}
                onValueChange={(value) => onStatusChange(item.id, value as "todo" | "in-progress" | "completed")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}