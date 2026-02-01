"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import { 
  Euro, 
  PieChart, 
  Plus, 
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
  getBudget, 
  getBudgetCategories, 
  setUserBudget, 
  addBudgetCategory, 
  updateBudgetCategory,
  deleteBudgetCategory,
  onBudgetChange
} from "@/lib/budget-service";

export default function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  
  // Form states
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("EUR");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState("");
  const [categoryColor, setCategoryColor] = useState("#A5C9FF");
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  const colorOptions = [
    { name: "Bleu doux", value: "#A5C9FF" },
    { name: "Vert menthe", value: "#B8E6CF" },
    { name: "Lavande", value: "#C9B8FF" },
    { name: "Corail", value: "#FFC7B2" },
    { name: "Saumon", value: "#FFB7B2" },
    { name: "Jaune pastel", value: "#FFE9A3" },
  ];

  // Helpers
  const formatBudgetInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const num = parseInt(digits, 10);
    if (Number.isNaN(num)) return "";
    return num.toLocaleString("fr-FR");
  };

  const parseNumericInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits ? parseInt(digits, 10) : NaN;
  };

  useEffect(() => {
    if (budget?.currency) {
      setBudgetCurrency(budget.currency);
    }
  }, [budget]);
  
  // Load budget data
  const fetchBudgetData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const budgetData = await getBudget();
      const categoriesData = await getBudgetCategories();
      setBudget(budgetData);
      setCategories(categoriesData);
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
      const amount = parseNumericInput(budgetAmount);
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
  
  const displayCurrency = budget?.currency || budgetCurrency || "EUR";

  // Derived totals based on spending items (categories)
  const derivedSpent = categories.reduce((sum, c) => sum + c.amount, 0);
  const derivedRemaining = budget ? Math.max(0, budget.totalAmount - derivedSpent) : 0;

  // Calculate progress
  const budgetProgress = budget && budget.totalAmount > 0
    ? (derivedSpent / budget.totalAmount) * 100
    : 0;
  
  return (
    <AppLayout requireAuth={true}>
      <div className="flex items-center gap-2 mb-6">
        <Euro className="h-6 w-6 text-primary" />
        <h1 className="text-xl md:text-3xl font-bold font-nunito">Gestion du Budget de Mariage</h1>
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
                    setBudgetAmount(budget.totalAmount.toLocaleString("fr-FR"));
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
                    {derivedSpent.toLocaleString()} {budget.currency}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="text-sm text-muted-foreground">Restant</h3>
                  <p className="text-2xl font-semibold text-green-500">
                    {derivedRemaining.toLocaleString()} {budget.currency}
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
                    {derivedSpent.toLocaleString()} {budget.currency} dépensés sur {budget.totalAmount.toLocaleString()} {budget.currency} ({Math.round(budgetProgress)}%)
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

          {/* Spending items Section */}
          <div className="bg-card rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Mes dépenses</h2>
                  <p className="text-sm text-muted-foreground">Créez vos postes (nom, montant, etc...) en une seule étape.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                <Input
                  id="spending-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Salle, DJ, Traiteur"
                  className="md:col-span-1"
                  disabled={!budget}
                />
                <div className="flex items-center gap-2 md:col-span-1">
                  <Input
                    id="spending-amount"
                    type="text"
                    min="0"
                    value={categoryAmount}
                    onChange={(e) => setCategoryAmount(formatBudgetInput(e.target.value))}
                    onBlur={(e) => setCategoryAmount(formatBudgetInput(e.target.value))}
                    placeholder={`Montant en ${displayCurrency}`}
                    disabled={!budget}
                  />
                  <span className="text-sm text-muted-foreground px-3 py-2 rounded border bg-muted/50">
                    {displayCurrency}
                  </span>
                </div>
                <div className="md:col-span-1 relative flex items-center">
                  <button
                    type="button"
                    disabled={!budget}
                    onClick={() => setShowColorDropdown((prev: boolean) => !prev)}
                    className="h-11 w-11 rounded-full border shadow-sm hover:scale-105 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: categoryColor }}
                    aria-label="Choisir la couleur"
                  />
                  {showColorDropdown && (
                    <div className="absolute z-20 top-12 w-48 rounded-md border bg-popover p-3 shadow-lg">
                      <div className="grid grid-cols-3 gap-2">
                        {colorOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`h-10 w-10 rounded-full border transition ${
                              categoryColor === opt.value ? "ring-2 ring-offset-2 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: opt.value }}
                            onClick={() => {
                              setCategoryColor(opt.value);
                              setShowColorDropdown(false);
                            }}
                            aria-label={opt.name}
                            title={opt.name}
                          >
                            {categoryColor === opt.value && (
                              <span className="text-xs font-semibold text-primary-foreground">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-1">
                  <Button
                    className="w-full"
                    onClick={async () => {
                      if (!budget) {
                        toast.error("Veuillez d'abord définir votre budget");
                        return;
                      }

                      if (!categoryName.trim()) {
                        toast.error("Veuillez entrer un nom");
                        return;
                      }

                      const amount = parseNumericInput(categoryAmount);
                      if (isNaN(amount) || amount <= 0) {
                        toast.error("Veuillez entrer un montant valide");
                        return;
                      }

                      try {
                        const success = editingCategoryId
                          ? await updateBudgetCategory(editingCategoryId, {
                              name: categoryName,
                              amount,
                              color: categoryColor
                            })
                          : await addBudgetCategory(categoryName, amount, categoryColor);

                        if (success) {
                          setCategoryName("");
                          setCategoryAmount("");
                          setCategoryColor("#A5C9FF");
                          setEditingCategoryId(null);
                          setShowColorDropdown(false);
                          fetchBudgetData();
                        }
                      } catch (error) {
                        console.error("Error saving spending item:", error);
                        toast.error("Erreur lors de l'enregistrement");
                      }
                    }}
                    disabled={!budget}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingCategoryId ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-6 text-center">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">Aucune dépense enregistrée</h3>
                  <p className="text-muted-foreground mb-2">
                    Ajoutez vos postes de dépense pour suivre l'allocation de votre budget.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Montant total disponible: {budget?.remaining.toLocaleString() || 0} {displayCurrency}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    return (
                      <div key={category.id} className="bg-background rounded-lg border overflow-hidden">
                        <div className="h-2" style={{ backgroundColor: category.color }}></div>
                        <div className="p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="font-medium truncate">{category.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                Créé le {category.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingCategoryId(category.id);
                                  setCategoryName(category.name);
                                  setCategoryAmount(category.amount.toLocaleString("fr-FR"));
                                  setCategoryColor(category.color);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={async () => {
                                  try {
                                    const success = await deleteBudgetCategory(category.id);
                                    if (success) {
                                      if (editingCategoryId === category.id) {
                                        setEditingCategoryId(null);
                                        setCategoryName("");
                                        setCategoryAmount("");
                                        setCategoryColor("#38BDF8");
                                      }
                                      fetchBudgetData();
                                    }
                                  } catch (error) {
                                    console.error("Error deleting spending item:", error);
                                    toast.error("Erreur lors de la suppression");
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Montant (dépensé):</span>
                              <span className="text-red-500 font-semibold">
                                {category.amount.toLocaleString()} {displayCurrency}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Considéré comme dépensé immédiatement.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                type="text"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(formatBudgetInput(e.target.value))}
                onBlur={(e) => setBudgetAmount(formatBudgetInput(e.target.value))}
                placeholder="Ex: 10 000"
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
                <option value="DZD">DZD (DA)</option>
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

    </AppLayout>
  );
} 