import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp
} from 'firebase/firestore';
import { toast } from 'sonner';

// Define interfaces
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  dueDate: Date | null;
  createdAt: Date;
  priority: "low" | "medium" | "high";
  userId: string;
}

// Create a custom event for checklist changes
const CHECKLIST_CHANGE_EVENT = 'checklist-change';

// Custom event dispatcher for checklist changes
export const dispatchChecklistChangeEvent = (itemId: string, action: 'add' | 'update' | 'delete') => {
  const event = new CustomEvent(CHECKLIST_CHANGE_EVENT, {
    detail: { itemId, action }
  });
  window.dispatchEvent(event);
};

// Listen for checklist changes
export const onChecklistChange = (callback: (itemId: string, action: 'add' | 'update' | 'delete') => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.itemId, customEvent.detail.action);
  };
  
  window.addEventListener(CHECKLIST_CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHECKLIST_CHANGE_EVENT, handler);
};

// Get user's checklist items
export const getChecklistItems = async (): Promise<ChecklistItem[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return [];
    }

    const checklistRef = collection(db, "users", user.uid, "checklist");
    const q = query(checklistRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const items: ChecklistItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        title: data.title,
        description: data.description || "",
        status: data.status,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        createdAt: data.createdAt.toDate(),
        priority: data.priority || "medium",
        userId: user.uid
      });
    });
    
    return items;
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    toast.error('Erreur lors du chargement des tâches');
    return [];
  }
};

// Add a new checklist item
export const addChecklistItem = async (
  title: string, 
  description: string = "", 
  dueDate: Date | null = null, 
  priority: "low" | "medium" | "high" = "medium"
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des tâches');
      return false;
    }

    const checklistRef = collection(db, "users", user.uid, "checklist");
    const docRef = await addDoc(checklistRef, {
      title,
      description,
      status: "todo",
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      createdAt: Timestamp.now(),
      priority,
      userId: user.uid
    });
    
    toast.success('Tâche ajoutée avec succès');
    
    // Dispatch event for UI updates
    dispatchChecklistChangeEvent(docRef.id, 'add');
    
    return true;
  } catch (error) {
    console.error('Error adding checklist item:', error);
    toast.error('Erreur lors de l\'ajout de la tâche');
    return false;
  }
};

// Update a checklist item
export const updateChecklistItem = async (
  itemId: string,
  updates: Partial<Omit<ChecklistItem, 'id' | 'userId' | 'createdAt'>>
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour modifier des tâches');
      return false;
    }

    const checklistItemRef = doc(db, "users", user.uid, "checklist", itemId);
    
    // Convert Date objects to Firestore Timestamps
    const firestoreUpdates: Record<string, any> = { ...updates };
    if (updates.dueDate) {
      firestoreUpdates.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    
    await updateDoc(checklistItemRef, firestoreUpdates);
    
    toast.success('Tâche mise à jour avec succès');
    
    // Dispatch event for UI updates
    dispatchChecklistChangeEvent(itemId, 'update');
    
    return true;
  } catch (error) {
    console.error('Error updating checklist item:', error);
    toast.error('Erreur lors de la mise à jour de la tâche');
    return false;
  }
};

// Delete a checklist item
export const deleteChecklistItem = async (itemId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer des tâches');
      return false;
    }

    const checklistItemRef = doc(db, "users", user.uid, "checklist", itemId);
    await deleteDoc(checklistItemRef);
    
    toast.success('Tâche supprimée');
    
    // Dispatch event for UI updates
    dispatchChecklistChangeEvent(itemId, 'delete');
    
    return true;
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    toast.error('Erreur lors de la suppression de la tâche');
    return false;
  }
};
