"use client";

import React, {useState, useEffect, useCallback} from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {useAuth} from "@/lib/auth-context";
import {CanteenAdminDTO} from "@/lib/canteen";
import apiClient from "@/lib/api/client";

interface DishDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  foodCategory: string;
  isAvailable: boolean;
  imageUrl: string|null;
  canteenId: number;
}



export default function MenuManagementPage() {
  const {isAdmin,isManager,canteenId:myCanteenId} = useAuth();
  const [selectedCanteenId,setSelectedCanteenId] = useState<number|null>(null);
  const effectiveCanteenId= isManager? myCanteenId: selectedCanteenId;
  const [canteenList,setCanteenList] = useState<CanteenAdminDTO[]>([]);

  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<DishDTO | null>(null);


  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    foodCategory: "",
    isAvailable: true,
  });

  const fetchDishes = useCallback(async () => {
    if(effectiveCanteenId===null){
      setDishes([]);
      return;
    }
    setIsLoading(true);
    try{
      const res = await apiClient.get(`/api/v1/canteens/${effectiveCanteenId}/dishes`);
      setDishes(res.data.data);
    }catch{
      toast.error("Failed to load dishes")
    }finally {
      setIsLoading(false);
    }
  },[effectiveCanteenId]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  useEffect(()=>{
    if(isAdmin){
      apiClient.get('/api/v1/canteens/admin-view').then(res=>setCanteenList(res.data.data));
    }
  },[isAdmin]);

  const availableCategories = Array.from(new Set(dishes.map((d)=>d.foodCategory)));
  const categoryTabs = ["ALL",...availableCategories];

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = activeCategory === "ALL" || dish.foodCategory === activeCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDialog = (dish?: DishDTO) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name,
        description: dish.description,
        price: dish.price.toString(),
        foodCategory: dish.foodCategory,
        isAvailable: dish.isAvailable,
      });
    } else {
      setEditingDish(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        foodCategory: "",
        isAvailable: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDish(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.foodCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try{
      if (editingDish) {
        await apiClient.put(`/api/v1/dishes/${editingDish.id}`,{
          ...formData,
          price,
          canteenId: effectiveCanteenId,
        });
        toast.success("Dish updated successfully!");
      } else {
        await apiClient.post(`/api/v1/canteens/${effectiveCanteenId}/dishes`,{
          ...formData,
          price,
          canteenId:effectiveCanteenId,
        });
        toast.success("Dish added successfully!");
      }

      handleCloseDialog();
      await fetchDishes();
    }catch{
      toast.error("Failed to save dish")
    }
  };

  const handleDeleteDish = async(dishId: number, dishName: string) => {
    try{
      await apiClient.delete(`/api/v1/dishes/${dishId}`);
      toast.success(`"${dishName}" has been removed from the menu`);
      await fetchDishes();
    }catch{
      toast.error("Failed to delete dish");
    }
  };

  const handleToggleAvailability = async(dish: DishDTO) => {
    try{
      await apiClient.put(`/api/v1/dishes/${dish.id}`,{
        ...dish,
        isAvailable: !dish.isAvailable,
      });
      toast.success(dish.isAvailable ? "Dish marked as unavailable" : "Dish marked as available");
      await fetchDishes();
    }catch{
      toast.error("Failed to update availability")
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">
            {effectiveCanteenId === null ? "Select a canteen to manage its menu" : "Manage the menu for this canteen"}
          </p>
        </div>
        <div className="flex items-center gap-3">
            {isAdmin && (
                <Select value={selectedCanteenId?.toString() ?? "none"} onValueChange={(v) => setSelectedCanteenId(v === "none" ? null : parseInt(v))}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select a canteen" /></SelectTrigger>
                  <SelectContent>
                    {canteenList.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            )}
            <Button
                onClick={() => handleOpenDialog()}
                className="gap-2 rounded-xl bg-ucd-coral text-white hover:bg-ucd-coral/90"
            >
              <Plus className="h-4 w-4" />
              Add Dish
            </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeCategory === tab ? "default" : "outline"}
              onClick={() => setActiveCategory(tab)}
              className={cn(
                "rounded-xl",
                activeCategory === tab
                  ? "bg-ucd-sage text-white hover:bg-ucd-sage/90"
                  : "border-[#EAE5D9] hover:border-ucd-sage hover:text-ucd-sage"
              )}
            >
              {tab==="ALL"? "All":tab}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border-[#EAE5D9] bg-white pl-10"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      {effectiveCanteenId === null?(
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            Please select a canteen to view its menu.
          </div>
          ):isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="rounded-3xl border-[#EAE5D9]">
              <Skeleton className="h-48 w-full rounded-t-3xl" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No dishes found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDishes.map((dish) => (
            <Card
              key={dish.id}
              className="group overflow-hidden rounded-3xl border-[#EAE5D9] bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={dish.imageUrl??"/OIP.png"}
                  alt={dish.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <Badge variant="secondary" className="absolute left-3 top-3 rounded-full bg-ucd-sage/10 text-ucd-sage">
                  {dish.foodCategory}
                </Badge>
                {!dish.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="rounded-lg bg-white px-3 py-1 text-sm font-medium text-gray-700">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>


              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-1">{dish.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {dish.description}
                </p>
                <p className="mt-2 text-lg font-bold text-ucd-coral">
                  {dish.price.toFixed(2)}€
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#EAE5D9] pt-4">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(dish)}
                      className="h-9 w-9 text-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDish(dish.id, dish.name)}
                      className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`available-${dish.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Available
                    </Label>
                    <Switch
                      id={`available-${dish.id}`}
                      checked={dish.isAvailable}
                      onCheckedChange={() => handleToggleAvailability(dish)}
                      className="data-[state=checked]:bg-ucd-sage"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingDish ? "Edit Dish" : "Add New Dish"}</DialogTitle>
            <DialogDescription>
              {editingDish ? "Update the dish details below" : "Fill in the details for the new dish"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dish Name *</Label>
              <Input
                id="name"
                placeholder="Enter dish name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the dish"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                    id="category"
                    placeholder="e.g. Main Course, Beverage"
                    value={formData.foodCategory}
                    onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
                    className="rounded-xl"
                    list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {availableCategories.map((cat) => <option key={cat} value={cat} />)}
                </datalist>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#EAE5D9] p-4">
              <div>
                <Label htmlFor="available">Availability</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to make this dish available for ordering
                </p>
              </div>
              <Switch
                id="available"
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAvailable: checked })
                }
                className="data-[state=checked]:bg-ucd-sage"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-xl bg-ucd-coral text-white hover:bg-ucd-coral/90"
            >
              {editingDish ? "Update Dish" : "Add Dish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
