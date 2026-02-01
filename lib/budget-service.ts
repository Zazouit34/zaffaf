import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { toast } from 'sonner';

// Define interfaces
export interface Budget {
  id: string;
  totalAmount: number;
  currency: string;
  spent: number;
  remaining: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  color: string;
  userId: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
  paid: boolean;
  vendor?: string;
  notes?: string;
  userId: string;
  createdAt: Date;
}

// Custom event
const BUDGET_CHANGE_EVENT = 'budget-change';

// Custom event dispatcher for budget changes
export const dispatchBudgetChangeEvent = () => {
  const event = new CustomEvent(BUDGET_CHANGE_EVENT);
  window.dispatchEvent(event);
};

// Listen for budget changes
export const onBudgetChange = (callback: () => void) => {
  const handler = () => {
    callback();
  };
  
  window.addEventListener(BUDGET_CHANGE_EVENT, handler);
  return () => window.removeEventListener(BUDGET_CHANGE_EVENT, handler);
};

const recalcBudgetFromCategories = async (userId: string) => {
  const budgetRef = doc(db, "users", userId, "budget", "main");
  const budgetSnap = await getDoc(budgetRef);
  if (!budgetSnap.exists()) return null;

  const categoriesRef = collection(db, "users", userId, "budgetCategories");
  const categoriesSnap = await getDocs(categoriesRef);
  let totalSpent = 0;
  categoriesSnap.forEach((cat) => {
    const data = cat.data();
    totalSpent += data.amount || 0;
  });

  const totalAmount = budgetSnap.data().totalAmount || 0;
  const remaining = Math.max(0, totalAmount - totalSpent);

  await updateDoc(budgetRef, {
    spent: totalSpent,
    remaining,
    updatedAt: Timestamp.now()
  });

  return { totalSpent, remaining };
};

// Get user's budget
export const getBudget = async (): Promise<Budget | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    const budgetRef = doc(db, "users", user.uid, "budget", "main");
    const budgetSnap = await getDoc(budgetRef);
    
    if (!budgetSnap.exists()) {
      return null;
    }
    
    const data = budgetSnap.data();
    return {
      id: budgetSnap.id,
      totalAmount: data.totalAmount,
      currency: data.currency,
      spent: data.spent,
      remaining: data.remaining,
      userId: user.uid,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };
    
  } catch (error) {
    console.error('Error fetching budget:', error);
    toast.error('Erreur lors du chargement du budget');
    return null;
  }
};

// Initialize or update budget
export const setUserBudget = async (totalAmount: number, currency: string = "EUR"): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour configurer un budget');
      return false;
    }

    const budgetRef = doc(db, "users", user.uid, "budget", "main");
    const budgetSnap = await getDoc(budgetRef);
    
    const now = Timestamp.now();
    
    if (!budgetSnap.exists()) {
      // Create new budget
      await setDoc(budgetRef, {
        totalAmount,
        currency,
        spent: 0,
        remaining: totalAmount,
        userId: user.uid,
        createdAt: now,
        updatedAt: now
      });
      
      toast.success('Budget créé avec succès');
    } else {
      // Update existing budget
      await updateDoc(budgetRef, {
        totalAmount,
        currency,
        remaining: totalAmount - (budgetSnap.data().spent || 0),
        updatedAt: now
      });
      
      toast.success('Budget mis à jour avec succès');
    }

    // Recalculate spent/remaining based on current categories (single-step spending model)
    await recalcBudgetFromCategories(user.uid);
    
    dispatchBudgetChangeEvent();
    return true;
    
  } catch (error) {
    console.error('Error setting budget:', error);
    toast.error('Erreur lors de la configuration du budget');
    return false;
  }
};

// Get user's budget categories
export const getBudgetCategories = async (): Promise<BudgetCategory[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return [];
    }

    const categoriesRef = collection(db, "users", user.uid, "budgetCategories");
    const q = query(categoriesRef, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    
    const categories: BudgetCategory[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name,
        amount: data.amount,
        spent: data.spent ?? data.amount ?? 0,
        remaining: data.remaining ?? 0,
        color: data.color,
        userId: user.uid,
        createdAt: data.createdAt.toDate()
      });
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching budget categories:', error);
    toast.error('Erreur lors du chargement des catégories de budget');
    return [];
  }
};

// Add a new budget category
export const addBudgetCategory = async (
  name: string,
  amount: number,
  color: string
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des catégories');
      return false;
    }

    // First, get main budget to make sure we have enough remaining
    const budgetRef = doc(db, "users", user.uid, "budget", "main");
    const budgetSnap = await getDoc(budgetRef);
    
    if (!budgetSnap.exists()) {
      toast.error('Veuillez d\'abord configurer votre budget total');
      return false;
    }
    
    // Check how much is already allocated to categories
    const categories = await getBudgetCategories();
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0);
    
    const budgetData = budgetSnap.data();
    const totalBudget = budgetData.totalAmount;
    
    // Make sure we're not exceeding the total budget with this new category
    if (totalAllocated + amount > totalBudget) {
      toast.error(`Le montant dépasse votre budget. Montant restant à allouer: ${totalBudget - totalAllocated}`);
      return false;
    }

    // Add the category (treated as fully spent immediately)
    const categoriesRef = collection(db, "users", user.uid, "budgetCategories");
    await addDoc(categoriesRef, {
      name,
      amount,
      spent: amount,
      remaining: 0,
      color,
      userId: user.uid,
      createdAt: Timestamp.now()
    });
    
    toast.success('Catégorie de budget ajoutée');
    
    await recalcBudgetFromCategories(user.uid);
    dispatchBudgetChangeEvent();
    return true;
    
  } catch (error) {
    console.error('Error adding budget category:', error);
    toast.error('Erreur lors de l\'ajout de la catégorie');
    return false;
  }
};

// Update a budget category
export const updateBudgetCategory = async (
  categoryId: string,
  updates: Partial<Pick<BudgetCategory, 'name' | 'amount' | 'color'>>
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour modifier des catégories');
      return false;
    }

    const categoryRef = doc(db, "users", user.uid, "budgetCategories", categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      toast.error('Catégorie introuvable');
      return false;
    }

    const budgetRef = doc(db, "users", user.uid, "budget", "main");
    const budgetSnap = await getDoc(budgetRef);
    if (!budgetSnap.exists()) {
      toast.error('Budget introuvable');
      return false;
    }

    const totalBudget = budgetSnap.data().totalAmount || 0;

    // If amount changes, ensure we stay within total budget
    if (updates.amount !== undefined) {
      const categories = await getBudgetCategories();
      const otherTotal = categories
        .filter((c) => c.id !== categoryId)
        .reduce((sum, c) => sum + c.amount, 0);

      if (updates.amount + otherTotal > totalBudget) {
        toast.error(`Montant trop élevé. Reste dans le budget total: ${totalBudget - otherTotal}`);
        return false;
      }
    }

    await updateDoc(categoryRef, {
      ...updates,
      // In the single-step spending model, the item is fully spent
      ...(updates.amount !== undefined ? { spent: updates.amount, remaining: 0 } : {})
    });

    await recalcBudgetFromCategories(user.uid);
    toast.success('Catégorie de budget mise à jour');
    
    dispatchBudgetChangeEvent();
    return true;
    
  } catch (error) {
    console.error('Error updating budget category:', error);
    toast.error('Erreur lors de la mise à jour de la catégorie');
    return false;
  }
};

// Delete a budget category
export const deleteBudgetCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer des catégories');
      return false;
    }

    // Get category amount to update main budget
    const categoryRef = doc(db, "users", user.uid, "budgetCategories", categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      toast.error('Catégorie introuvable');
      return false;
    }
    
    const categoryAmount = categorySnap.data().amount || 0;
    
    // Delete the category
    await deleteDoc(categoryRef);
    
    await recalcBudgetFromCategories(user.uid);
    
    toast.success('Catégorie de budget supprimée');
    
    dispatchBudgetChangeEvent();
    return true;
    
  } catch (error) {
    console.error('Error deleting budget category:', error);
    toast.error('Erreur lors de la suppression de la catégorie');
    return false;
  }
};

// Get user's expenses
export const getExpenses = async (categoryId?: string): Promise<Expense[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return [];
    }

    const expensesRef = collection(db, "users", user.uid, "expenses");
    
    // Create query based on whether categoryId is provided
    const q = categoryId 
      ? query(
          expensesRef, 
          where("categoryId", "==", categoryId),
          orderBy("date", "desc")
        )
      : query(
          expensesRef, 
          orderBy("date", "desc")
        );
    
    const querySnapshot = await getDocs(q);
    
    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        categoryId: data.categoryId,
        description: data.description,
        amount: data.amount,
        date: data.date.toDate(),
        paid: data.paid,
        vendor: data.vendor,
        notes: data.notes,
        userId: user.uid,
        createdAt: data.createdAt.toDate()
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    toast.error('Erreur lors du chargement des dépenses');
    return [];
  }
};

// Add a new expense
export const addExpense = async (
  categoryId: string,
  description: string,
  amount: number,
  date: Date,
  paid: boolean = false,
  vendor?: string,
  notes?: string
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des dépenses');
      return false;
    }

    // Check if category exists and has enough remaining budget
    const categoryRef = doc(db, "users", user.uid, "budgetCategories", categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      toast.error('Catégorie introuvable');
      return false;
    }
    
    const categoryData = categorySnap.data();
    const categoryRemaining = categoryData.remaining || 0;
    
    if (amount > categoryRemaining) {
      toast.error(`Montant trop élevé. Reste dans cette catégorie: ${categoryRemaining}`);
      return false;
    }

    // Add the expense
    const expensesRef = collection(db, "users", user.uid, "expenses");
    await addDoc(expensesRef, {
      categoryId,
      description,
      amount,
      date: Timestamp.fromDate(date),
      paid,
      vendor: vendor || "",
      notes: notes || "",
      userId: user.uid,
      createdAt: Timestamp.now()
    });
    
    // Update the category's spent and remaining amount
    const newSpent = (categoryData.spent || 0) + amount;
    const newRemaining = categoryData.amount - newSpent;
    
    await updateDoc(categoryRef, {
      spent: newSpent,
      remaining: newRemaining
    });
    
    // Update the main budget's spent and remaining amount
    const budgetRef = doc(db, "users", user.uid, "budget", "main");
    await runTransaction(db, async (transaction) => {
      const budgetDoc = await transaction.get(budgetRef);
      if (!budgetDoc.exists()) {
        throw "Budget document does not exist!";
      }
      
      const budgetData = budgetDoc.data();
      const newSpent = (budgetData.spent || 0) + amount;
      const newRemaining = budgetData.totalAmount - newSpent;
      
      transaction.update(budgetRef, { 
        spent: newSpent,
        remaining: newRemaining,
        updatedAt: Timestamp.now()
      });
    });
    
    toast.success('Dépense ajoutée avec succès');
    
    dispatchBudgetChangeEvent();
    return true;
    
  } catch (error) {
    console.error('Error adding expense:', error);
    toast.error('Erreur lors de l\'ajout de la dépense');
    return false;
  }
};

// Update an expense
export const updateExpense = async (
  expenseId: string,
  updates: Partial<Pick<Expense, 'description' | 'amount' | 'date' | 'paid' | 'vendor' | 'notes' | 'categoryId'>>
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour modifier des dépenses');
      return false;
    }

    // Get the current expense to calculate difference
    const expenseRef = doc(db, "users", user.uid, "expenses", expenseId);
    const expenseSnap = await getDoc(expenseRef);
    
    if (!expenseSnap.exists()) {
      toast.error('Dépense introuvable');
      return false;
    }
    
    const expenseData = expenseSnap.data();
    const currentAmount = expenseData.amount || 0;
    const currentCategoryId = expenseData.categoryId;

    let newAmount = updates.amount !== undefined ? updates.amount : currentAmount;
    let newCategoryId = updates.categoryId !== undefined ? updates.categoryId : currentCategoryId;
    
    // Check if category is being changed or amount is being modified
    if (newCategoryId !== currentCategoryId || newAmount !== currentAmount) {
      // Validate new category if it's changed
      if (newCategoryId !== currentCategoryId) {
        const newCategoryRef = doc(db, "users", user.uid, "budgetCategories", newCategoryId);
        const newCategorySnap = await getDoc(newCategoryRef);
        
        if (!newCategorySnap.exists()) {
          toast.error('Nouvelle catégorie introuvable');
          return false;
        }
        
        const newCategoryData = newCategorySnap.data();
        
        // Check if the new category has enough budget for this expense
        if (newAmount > (newCategoryData.remaining || 0)) {
          toast.error(`Montant trop élevé pour la nouvelle catégorie. Reste: ${newCategoryData.remaining}`);
          return false;
        }
      } else if (newAmount > currentAmount) {
        // If we're just increasing the amount, check if there's enough remaining in the current category
        const categoryRef = doc(db, "users", user.uid, "budgetCategories", currentCategoryId);
        const categorySnap = await getDoc(categoryRef);
        
        if (!categorySnap.exists()) {
          toast.error('Catégorie introuvable');
          return false;
        }
        
        const categoryData = categorySnap.data();
        const amountDifference = newAmount - currentAmount;
        
        if (amountDifference > (categoryData.remaining || 0)) {
          toast.error(`Augmentation trop élevée. Reste dans la catégorie: ${categoryData.remaining}`);
          return false;
        }
      }
    }

    // Update the expense
    const updateData: any = { ...updates };
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }
    
    await updateDoc(expenseRef, updateData);
    
    // Handle category and budget updates based on amount or category changes
    if (newCategoryId !== currentCategoryId || newAmount !== currentAmount) {
      // Update the old category first (decrease spent and increase remaining)
      const oldCategoryRef = doc(db, "users", user.uid, "budgetCategories", currentCategoryId);
      await runTransaction(db, async (transaction) => {
        const oldCategoryDoc = await transaction.get(oldCategoryRef);
        if (!oldCategoryDoc.exists()) {
          throw "Original category document does not exist!";
        }
        
        const oldCategoryData = oldCategoryDoc.data();
        const newSpent = (oldCategoryData.spent || 0) - currentAmount;
        const newRemaining = oldCategoryData.amount - newSpent;
        
        transaction.update(oldCategoryRef, { 
          spent: newSpent,
          remaining: newRemaining
        });
      });
      
      // Update the new category (increase spent and decrease remaining)
      const newCategoryRef = doc(db, "users", user.uid, "budgetCategories", newCategoryId);
      await runTransaction(db, async (transaction) => {
        const newCategoryDoc = await transaction.get(newCategoryRef);
        if (!newCategoryDoc.exists()) {
          throw "New category document does not exist!";
        }
        
        const newCategoryData = newCategoryDoc.data();
        const newSpent = (newCategoryData.spent || 0) + newAmount;
        const newRemaining = newCategoryData.amount - newSpent;
        
        transaction.update(newCategoryRef, { 
          spent: newSpent,
          remaining: newRemaining
        });
      });
      
      // Update the main budget
      const amountDifference = newAmount - currentAmount; // could be 0, positive, or negative
      
      if (amountDifference !== 0) {
        const budgetRef = doc(db, "users", user.uid, "budget", "main");
        await runTransaction(db, async (transaction) => {
          const budgetDoc = await transaction.get(budgetRef);
          if (!budgetDoc.exists()) {
            throw "Budget document does not exist!";
          }
          
          const budgetData = budgetDoc.data();
          const newSpent = (budgetData.spent || 0) + amountDifference;
          const newRemaining = budgetData.totalAmount - newSpent;
          
          transaction.update(budgetRef, { 
            spent: newSpent,
            remaining: newRemaining,
            updatedAt: Timestamp.now()
          });
        });
      }
    }
    
    toast.success('Dépense mise à jour avec succès');
    
    dispatchBudgetChangeEvent();
    return true;
    
  } catch (error) {
    console.error('Error updating expense:', error);
    toast.error('Erreur lors de la mise à jour de la dépense');
    return false;
  }
};

// Delete an expense
export const deleteExpense = async (expenseId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer des dépenses');
      return false;
    }

    // Get the expense details before deleting
    const expenseRef = doc(db, "users", user.uid, "expenses", expenseId);
    const expenseSnap = await getDoc(expenseRef);
    
    if (!expenseSnap.exists()) {
      toast.error('Dépense introuvable');
      return false;
    }
    
    const expenseData = expenseSnap.data();
    const amount = expenseData.amount || 0;
    const categoryId = expenseData.categoryId;
    
    // Delete the expense
    await deleteDoc(expenseRef);
    
    // Update the category
    const categoryRef = doc(db, "users", user.uid, "budgetCategories", categoryId);
    await runTransaction(db, async (transaction) => {
      const categoryDoc = await transaction.get(categoryRef);
      if (!categoryDoc.exists()) {
        throw "Category document does not exist!";
      }
      
      const categoryData = categoryDoc.data();
      const newSpent = (categoryData.spent || 0) - amount;
      const newRemaining = categoryData.amount - newSpent;
      
      transaction.update(categoryRef, { 
        spent: newSpent,
        remaining: newRemaining
      });
    });
    
    // Update the main budget
    const budgetRef = doc(db, "users", user.uid, "budget", "main");
    await runTransaction(db, async (transaction) => {
      const budgetDoc = await transaction.get(budgetRef);
      if (!budgetDoc.exists()) {
        throw "Budget document does not exist!";
      }
      
      const budgetData = budgetDoc.data();
      const newSpent = (budgetData.spent || 0) - amount;
      const newRemaining = budgetData.totalAmount - newSpent;
      
      transaction.update(budgetRef, { 
        spent: newSpent,
        remaining: newRemaining,
        updatedAt: Timestamp.now()
      });
    });
    
    toast.success('Dépense supprimée avec succès');
    
    dispatchBudgetChangeEvent();
    return true;
    
  } catch (error) {
    console.error('Error deleting expense:', error);
    toast.error('Erreur lors de la suppression de la dépense');
    return false;
  }
}; 