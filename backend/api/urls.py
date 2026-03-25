from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShopViewSet, CategoryViewSet, ProductViewSet, 
    SaleViewSet, SupplierViewSet, PurchaseViewSet, 
    ExpenseCategoryViewSet, ExpenseViewSet, user_me, UserViewSet,
    BrandViewSet, UnitViewSet, CustomerViewSet, StockAdjustmentViewSet,
    StockTransferViewSet, SaleReturnViewSet
)

router = DefaultRouter()
router.register(r'shops', ShopViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'units', UnitViewSet)
router.register(r'products', ProductViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'purchases', PurchaseViewSet)
router.register(r'expense-categories', ExpenseCategoryViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'stock-adjustments', StockAdjustmentViewSet)
router.register(r'stock-transfers', StockTransferViewSet)
router.register(r'returns', SaleReturnViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user/me/', user_me, name='user_me'),
]
