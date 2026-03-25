from django.contrib import admin
from .models import (
    Shop, UserProfile, Category, Product, 
    Supplier, Purchase, PurchaseItem, 
    Sale, SaleItem, ExpenseCategory, Expense
)

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'currency', 'created_at')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'shop', 'role')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'shop')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'barcode', 'price', 'stock_quantity', 'shop')
    search_fields = ('name', 'barcode')

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'phone', 'shop')

class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 1

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'total_amount', 'purchase_date')
    inlines = [PurchaseItemInline]

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'cashier', 'total_amount', 'timestamp')
    inlines = [SaleItemInline]

@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'shop')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'date', 'shop')
