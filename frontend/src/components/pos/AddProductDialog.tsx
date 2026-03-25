import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShop } from "@/context/ShopContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").trim(),
  category: z.string().min(1, "Please select a category"),
  buying_price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Invalid buying price"),
  selling_price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Invalid selling price"),
  stock_quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, "Invalid stock quantity"),
  barcode: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddProductDialog = ({ open, onOpenChange, onSuccess }: AddProductDialogProps) => {
  const { categories, currentShop } = useShop();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      buying_price: "",
      selling_price: "",
      stock_quantity: "",
      barcode: "",
      description: "",
    }
  });

  const categoryValue = watch("category");

  const onSubmit = async (data: ProductFormValues) => {
    if (!currentShop) return;

    setIsLoading(true);
    try {
      await api.post("products/", {
        ...data,
        shop: currentShop.id,
        buying_price: parseFloat(data.buying_price),
        selling_price: parseFloat(data.selling_price),
        stock_quantity: parseInt(data.stock_quantity),
      });
      toast.success("Product added successfully");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Enter the details of the new product to add it to the inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register("name")} required />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => setValue("category", value)}
              value={categoryValue}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="buying_price">Buying Price</Label>
              <Input
                id="buying_price"
                type="number"
                step="0.01"
                {...register("buying_price")}
                required
              />
              {errors.buying_price && <span className="text-xs text-red-500">{errors.buying_price.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="selling_price">Selling Price</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                {...register("selling_price")}
                required
              />
              {errors.selling_price && <span className="text-xs text-red-500">{errors.selling_price.message}</span>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Initial Stock</Label>
            <Input
              id="stock"
              type="number"
              {...register("stock_quantity")}
              required
            />
            {errors.stock_quantity && <span className="text-xs text-red-500">{errors.stock_quantity.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input
              id="barcode"
              {...register("barcode")}
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
