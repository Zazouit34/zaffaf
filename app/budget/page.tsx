"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import { 
  Euro, 
  PieChart, 
  Plus, 
  CreditCard, 
  Edit2, 
  Trash2,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Budget, 
  BudgetCategory, 
  Expense, 
  getBudget, 
  getBudgetCategories, 
  getExpenses,
  setUserBudget, 
  addBudgetCategory, 
  addExpense,
  onBudgetChange
} from "@/lib/budget-service";

export default function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  // Form states
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("EUR");
  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState("");
  const [categoryColor, setCategoryColor] = useState("#38BDF8");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
  const [expenseVendor, setExpenseVendor] = useState("");
  const [expenseIsPaid, setExpenseIsPaid] = useState(false);
  
  // Load budget data
  const fetchBudgetData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const budgetData = await getBudget();
      const categoriesData = await getBudgetCategories();
      const expensesData = await getExpenses();
      
      setBudget(budgetData);
      setCategories(categoriesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error fetching budget data:", error);
      toast.error("Erreur lors du chargement des données de budget");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle budget creation/update
  const handleSetBudget = async () => {
    if (!user) return;
    
    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Veuillez entrer un montant valide");
        return;
      }
      
      const success = await setUserBudget(amount, budgetCurrency);
      if (success) {
        setShowBudgetDialog(false);
        fetchBudgetData();
      }
    } catch (error) {
      console.error("Error setting budget:", error);
      toast.error("Erreur lors de la configuration du budget");
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchBudgetData();
      
      // Listen for changes to budget to update the data
      const unsubscribe = onBudgetChange(() => {
        fetchBudgetData();
      });
      
      return () => unsubscribe();
    }
  }, [user]);
  
  // Calculate progress of the budget
  const budgetProgress = budget ? (budget.spent / budget.totalAmount) * 100 : 0;
  
  return (
    <AppLayout requireAuth={true}>
      <div className="flex items-center gap-2 mb-6">
        <Euro className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold font-nunito">Gestion du Budget de Mariage</h1>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Budget Overview Section */}
          <div className="bg-card rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-xl font-bold">Aperçu du Budget</h2>
              <Button 
                onClick={() => {
                  if (budget) {
                    setBudgetAmount(budget.totalAmount.toString());
                    setBudgetCurrency(budget.currency);
                  }
                  setShowBudgetDialog(true);
                }}
                className="mt-2 md:mt-0"
              >
                {budget ? "Modifier le budget" : "Configurer le budget"}
              </Button>
            </div>
            
            {budget ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="text-sm text-muted-foreground">Budget Total</h3>
                  <p className="text-2xl font-semibold">
                    {budget.totalAmount.toLocaleString()} {budget.currency}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="text-sm text-muted-foreground">Dépensé</h3>
                  <p className="text-2xl font-semibold text-red-500">
                    {budget.spent.toLocaleString()} {budget.currency}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="text-sm text-muted-foreground">Restant</h3>
                  <p className="text-2xl font-semibold text-green-500">
                    {budget.remaining.toLocaleString()} {budget.currency}
                  </p>
                </div>
                
                <div className="md:col-span-3 mt-4">
                  <div className="w-full bg-muted rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        budgetProgress > 90 ? 'bg-red-500' : 
                        budgetProgress > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, budgetProgress)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {budget.spent.toLocaleString()} {budget.currency} dépensés sur {budget.totalAmount.toLocaleString()} {budget.currency} ({Math.round(budgetProgress)}%)
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">Aucun budget configuré</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par définir votre budget total pour le mariage
                </p>
                <Button onClick={() => setShowBudgetDialog(true)}>
                  Configurer mon budget
                </Button>
              </div>
            )}
          </div>

          {/* Budget Categories Section */}
          <div className="bg-card rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-xl font-bold">Catégories de Budget</h2>
              <Button 
                onClick={() => {
                  setCategoryName("");
                  setCategoryAmount("");
                  setCategoryColor("#38BDF8");
                  setShowCategoryDialog(true);
                }}
                className="mt-2 md:mt-0"
                disabled={!budget}
              >
                <Plus className="h-4 w-4 mr-2" /> Ajouter une catégorie
              </Button>
            </div>
            
            {categories.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">Aucune catégorie de budget</h3>
                <p className="text-muted-foreground mb-4">
                  Créez des catégories pour répartir votre budget
                </p>
                <Button 
                  onClick={() => setShowCategoryDialog(true)} 
                  disabled={!budget}
                >
                  Ajouter ma première catégorie
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-background rounded-lg border overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: category.color }}></div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{category.name}</h3>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Alloué:</span>
                          <span>{category.amount.toLocaleString()} {budget?.currency}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Dépensé:</span>
                          <span className="text-red-500">{category.spent.toLocaleString()} {budget?.currency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Restant:</span>
                          <span className="text-green-500">{category.remaining.toLocaleString()} {budget?.currency}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (category.spent / category.amount) * 100)}%`, 
                              backgroundColor: category.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses Section */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-xl font-bold">Dépenses Récentes</h2>
              <Button 
                onClick={() => {
                  setExpenseCategory(categories.length > 0 ? categories[0].id : "");
                  setExpenseDescription("");
                  setExpenseAmount("");
                  setExpenseDate(new Date());
                  setExpenseVendor("");
                  setExpenseIsPaid(false);
                  setShowExpenseDialog(true);
                }}
                className="mt-2 md:mt-0"
                disabled={categories.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" /> Ajouter une dépense
              </Button>
            </div>
            
            {expenses.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">Aucune dépense</h3>
                <p className="text-muted-foreground mb-4">
                  Ajoutez des dépenses pour suivre votre consommation de budget
                </p>
                <Button 
                  onClick={() => setShowExpenseDialog(true)} 
                  disabled={categories.length === 0}
                >
                  Ajouter ma première dépense
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Catégorie</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Vendeur</th>
                      <th className="text-right py-3 font-medium text-muted-foreground">Montant</th>
                      <th className="text-center py-3 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right py-3 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 5).map((expense) => {
                      const category = categories.find(c => c.id === expense.categoryId);
                      return (
                        <tr key={expense.id} className="border-b hover:bg-muted/30">
                          <td className="py-3">
                            {expense.date.toLocaleDateString()}
                          </td>
                          <td className="py-3 max-w-[200px] truncate">
                            {expense.description}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category?.color || "#ccc" }}
                              ></div>
                              <span>{category?.name || "Inconnue"}</span>
                            </div>
                          </td>
                          <td className="py-3 max-w-[120px] truncate">
                            {expense.vendor || "-"}
                          </td>
                          <td className="py-3 text-right font-medium">
                            {expense.amount.toLocaleString()} {budget?.currency}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              expense.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {expense.paid ? 'Payé' : 'À payer'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {expenses.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="link">
                      Voir toutes les dépenses ({expenses.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {budget ? "Modifier le budget" : "Configurer le budget"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="budget-amount">
                Montant total du budget
              </label>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                step="100"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="Ex: 10000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="budget-currency">
                Devise
              </label>
              <select
                id="budget-currency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={budgetCurrency}
                onChange={(e) => setBudgetCurrency(e.target.value)}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="CHF">CHF (Fr)</option>
                <option value="MAD">MAD (DH)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSetBudget}>
              {budget ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie de budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category-name">
                Nom de la catégorie
              </label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Réception, Traiteur, Tenues..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category-amount">
                Montant alloué
              </label>
              <Input
                id="category-amount"
                type="number"
                min="0"
                value={categoryAmount}
                onChange={(e) => setCategoryAmount(e.target.value)}
                placeholder="Montant en  {budget?.currency || 'EUR'}"
              />
              {budget && (
                <p className="text-xs text-muted-foreground mt-1">
                  Budget restant non alloué: {budget.remaining.toLocaleString()} {budget.currency}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category-color">
                Couleur
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="category-color"
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="h-10 w-10 rounded border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{categoryColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Annuler
            </Button>
            <Button onClick={async () => {
              if (!categoryName.trim()) {
                toast.error("Veuillez entrer un nom pour la catégorie");
                return;
              }
              
              const amount = parseFloat(categoryAmount);
              if (isNaN(amount) || amount <= 0) {
                toast.error("Veuillez entrer un montant valide");
                return;
              }

              try {
                const success = await addBudgetCategory(
                  categoryName,
                  amount,
                  categoryColor
                );
                
                if (success) {
                  setShowCategoryDialog(false);
                  fetchBudgetData();
                }
              } catch (error) {
                console.error("Error adding category:", error);
                toast.error("Erreur lors de l'ajout de la catégorie");
              }
            }}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une dépense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="expense-category">
                Catégorie
              </label>
              <select
                id="expense-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} (Reste: {category.remaining} {budget?.currency})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="expense-description">
                Description
              </label>
              <Input
                id="expense-description"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Ex: Acompte traiteur, Essayage robe..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="expense-amount">
                Montant
              </label>
              <Input
                id="expense-amount"
                type="number"
                min="0"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder={`Montant en ${budget?.currency || 'EUR'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="expense-date">
                Date
              </label>
              <Input
                id="expense-date"
                type="date"
                value={expenseDate ? expenseDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setExpenseDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="expense-vendor">
                Vendeur (optionnel)
              </label>
              <Input
                id="expense-vendor"
                value={expenseVendor}
                onChange={(e) => setExpenseVendor(e.target.value)}
                placeholder="Nom du commerçant ou prestataire"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="expense-paid"
                checked={expenseIsPaid}
                onChange={(e) => setExpenseIsPaid(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="expense-paid" className="text-sm font-medium">
                Marquer comme payé
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              Annuler
            </Button>
            <Button onClick={async () => {
              if (!expenseCategory) {
                toast.error("Veuillez sélectionner une catégorie");
                return;
              }
              
              if (!expenseDescription.trim()) {
                toast.error("Veuillez entrer une description");
                return;
              }
              
              const amount = parseFloat(expenseAmount);
              if (isNaN(amount) || amount <= 0) {
                toast.error("Veuillez entrer un montant valide");
                return;
              }
              
              if (!expenseDate) {
                toast.error("Veuillez sélectionner une date");
                return;
              }

              try {
                const success = await addExpense(
                  expenseCategory,
                  expenseDescription,
                  amount,
                  expenseDate,
                  expenseIsPaid,
                  expenseVendor || undefined
                );
                
                if (success) {
                  setShowExpenseDialog(false);
                  fetchBudgetData();
                }
              } catch (error) {
                console.error("Error adding expense:", error);
                toast.error("Erreur lors de l'ajout de la dépense");
              }
            }}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
} 