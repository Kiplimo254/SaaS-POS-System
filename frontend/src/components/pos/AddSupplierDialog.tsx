import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShop } from "@/context/ShopContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const supplierSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").trim(),
  contact_person: z.string().min(2, "Contact person name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").trim(),
  address: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddSupplierDialog = ({ open, onOpenChange, onSuccess }: AddSupplierDialogProps) => {
  const { currentShop } = useShop();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
    }
  });

  const onSubmit = async (data: SupplierFormValues) => {
    if (!currentShop) return;

    setIsLoading(true);
    try {
      await api.post("suppliers/", {
        ...data,
        shop: currentShop.id,
      });
      toast.success("Supplier added successfully");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add supplier");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>Register a new supplier to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              {...register("name")}
              required
              placeholder="e.g. Global Tech Solutions"
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Person</Label>
            <Input
              id="contact"
              {...register("contact_person")}
              required
              placeholder="e.g. Jane Doe"
            />
            {errors.contact_person && <span className="text-xs text-red-500">{errors.contact_person.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                required
                placeholder="jane@supplier.com"
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                required
                placeholder="+254..."
              />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Physical office address"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
