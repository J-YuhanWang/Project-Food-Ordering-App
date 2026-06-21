"use client";

import React, { useState, useEffect } from "react";
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

// Types
type FoodCategory = "MAIN_COURSE" | "SIDES" | "DRINKS" | "DESSERTS";

interface DishDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  foodCategory: FoodCategory;
  isAvailable: boolean;
  imageUrl: string;
  canteenId: number;
}

const categoryConfig: Record<FoodCategory, { label: string; className: string }> = {
  MAIN_COURSE: { label: "Main Course", className: "bg-ucd-sage/10 text-ucd-sage" },
  SIDES: { label: "Sides", className: "bg-amber-100 text-amber-700" },
  DRINKS: { label: "Drinks", className: "bg-blue-100 text-blue-700" },
  DESSERTS: { label: "Desserts", className: "bg-pink-100 text-pink-700" },
};

const categoryTabs = [
  { value: "ALL", label: "All" },
  { value: "MAIN_COURSE", label: "Main Course" },
  { value: "SIDES", label: "Sides" },
  { value: "DRINKS", label: "Drinks" },
  { value: "DESSERTS", label: "Desserts" },
];

// Mock Data - UCD Campus Dishes
const mockDishes: DishDTO[] = [
  {
    id: 1,
    name: "Classic Beef Burger",
    description: "Juicy beef patty with fresh lettuce, tomato, and special sauce",
    price: 9.50,
    foodCategory: "MAIN_COURSE",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=400",
    canteenId: 1,
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Traditional Italian pizza with tomato, mozzarella, and fresh basil",
    price: 11.00,
    foodCategory: "MAIN_COURSE",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?w=400",
    canteenId: 1,
  },
  {
    id: 3,
    name: "Chicken Caesar Wrap",
    description: "Grilled chicken with romaine, parmesan, and Caesar dressing",
    price: 8.75,
    foodCategory: "MAIN_COURSE",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?w=400",
    canteenId: 2,
  },
  {
    id: 4,
    name: "Garlic Butter Fries",
    description: "Crispy fries tossed in garlic butter and herbs",
    price: 4.50,
    foodCategory: "SIDES",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?w=400",
    canteenId: 1,
  },
  {
    id: 5,
    name: "Chunky Chips",
    description: "Thick-cut potato chips with sea salt",
    price: 3.75,
    foodCategory: "SIDES",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?w=400",
    canteenId: 2,
  },
  {
    id: 6,
    name: "Iced Latte",
    description: "Espresso with cold milk served over ice",
    price: 4.20,
    foodCategory: "DRINKS",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/3905765/pexels-photo-3905765.jpeg?w=400",
    canteenId: 3,
  },
  {
    id: 7,
    name: "Fresh Lemonade",
    description: "Homemade lemonade with mint leaves",
    price: 3.50,
    foodCategory: "DRINKS",
    isAvailable: false,
    imageUrl: "https://images.pexels.com/photos/1624776/pexels-photo-1624776.jpeg?w=400",
    canteenId: 3,
  },
  {
    id: 8,
    name: "Chocolate Brownie",
    description: "Rich chocolate brownie with walnuts",
    price: 3.25,
    foodCategory: "DESSERTS",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/4556530/pexels-photo-4556530.jpeg?w=400",
    canteenId: 4,
  },
  {
    id: 9,
    name: "Irish Apple Pie",
    description: "Traditional apple pie with cinnamon and vanilla ice cream",
    price: 5.50,
    foodCategory: "DESSERTS",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/372263/pexels-photo-372263.jpeg?w=400",
    canteenId: 1,
  },
  {
    id: 10,
    name: "Vegetable Curry Bowl",
    description: "Spiced vegetable curry with basmati rice",
    price: 10.25,
    foodCategory: "MAIN_COURSE",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400",
    canteenId: 2,
  },
  {
    id: 11,
    name: "Green Smoothie",
    description: "Spinach, banana, and apple blended with almond milk",
    price: 5.00,
    foodCategory: "DRINKS",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/2268166/pexels-photo-2268166.jpeg?w=400",
    canteenId: 3,
  },
  {
    id: 12,
    name: "Coleslaw",
    description: "Fresh cabbage and carrot slaw with creamy dressing",
    price: 2.95,
    foodCategory: "SIDES",
    isAvailable: true,
    imageUrl: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?w=400",
    canteenId: 4,
  },
];

export default function MenuManagementPage() {
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
    foodCategory: "MAIN_COURSE" as FoodCategory,
    isAvailable: true,
  });

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setDishes(mockDishes);
    setIsLoading(false);
  };

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
        foodCategory: "MAIN_COURSE",
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
    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editingDish) {
      setDishes((prev) =>
        prev.map((d) =>
          d.id === editingDish.id ? { ...d, ...formData, price } : d
        )
      );
      toast.success("Dish updated successfully!");
    } else {
      const newDish: DishDTO = {
        id: Math.max(...dishes.map((d) => d.id)) + 1,
        name: formData.name,
        description: formData.description,
        price,
        foodCategory: formData.foodCategory,
        isAvailable: formData.isAvailable,
        imageUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400",
        canteenId: 1,
      };
      setDishes((prev) => [...prev, newDish]);
      toast.success("Dish added successfully!");
    }

    handleCloseDialog();
  };

  const handleDeleteDish = (dishId: number, dishName: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== dishId));
    toast.success(`"${dishName}" has been removed from the menu`);
  };

  const handleToggleAvailability = (dishId: number, currentStatus: boolean) => {
    setDishes((prev) =>
      prev.map((d) =>
        d.id === dishId ? { ...d, isAvailable: !currentStatus } : d
      )
    );
    toast.success(currentStatus ? "Dish marked as unavailable" : "Dish marked as available");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Manage dishes across all campus canteens</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="gap-2 rounded-xl bg-ucd-coral text-white hover:bg-ucd-coral/90"
        >
          <Plus className="h-4 w-4" />
          Add Dish
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeCategory === tab.value ? "default" : "outline"}
              onClick={() => setActiveCategory(tab.value)}
              className={cn(
                "rounded-xl",
                activeCategory === tab.value
                  ? "bg-ucd-sage text-white hover:bg-ucd-sage/90"
                  : "border-[#EAE5D9] hover:border-ucd-sage hover:text-ucd-sage"
              )}
            >
              {tab.label}
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
      {isLoading ? (
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
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <Badge
                  variant="secondary"
                  className={cn(
                    "absolute left-3 top-3 rounded-full",
                    categoryConfig[dish.foodCategory].className
                  )}
                >
                  {categoryConfig[dish.foodCategory].label}
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
                      onCheckedChange={() => handleToggleAvailability(dish.id, dish.isAvailable)}
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.foodCategory}
                  onValueChange={(value: FoodCategory) =>
                    setFormData({ ...formData, foodCategory: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN_COURSE">Main Course</SelectItem>
                    <SelectItem value="SIDES">Sides</SelectItem>
                    <SelectItem value="DRINKS">Drinks</SelectItem>
                    <SelectItem value="DESSERTS">Desserts</SelectItem>
                  </SelectContent>
                </Select>
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
