from rest_framework import viewsets, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .models import (
    Shop, UserProfile, Category, Product, 
    Supplier, Purchase, PurchaseItem, 
    Sale, SaleItem, ExpenseCategory, Expense,
    Brand, Unit, Customer, StockAdjustment, 
    StockTransfer, SaleReturn, SalePayment
)
from .serializers import (
    ShopSerializer, CategorySerializer, ProductSerializer, 
    SaleSerializer, SaleItemSerializer, UserSerializer,
    UserCreateSerializer, SupplierSerializer, PurchaseSerializer, 
    ExpenseCategorySerializer, ExpenseSerializer,
    BrandSerializer, UnitSerializer, CustomerSerializer,
    StockAdjustmentSerializer, StockTransferSerializer,
    SaleReturnSerializer
)
from django.contrib.auth.models import User
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q

class RolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        role = request.user.profile.role

        # Super Admins have global access
        if role == 'SUPER_ADMIN':
            return True
        
        # Managers and Admins can do everything within their shop
        if role in ['ADMIN', 'MANAGER']:
            return True
        
        # Cashiers have restricted access
        if role == 'CASHIER':
            # List of allowed viewsets/actions for Cashiers
            allowed_views = [
                'ProductViewSet', 'SaleViewSet', 'CategoryViewSet', 
                'ShopViewSet', 'CustomerViewSet', 'BrandViewSet', 'UnitViewSet'
            ]
            if view.__class__.__name__ in allowed_views:
                return True
        
        return False

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class ShopFilteredViewSet(viewsets.ModelViewSet):
    permission_classes = [RolePermission]

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.role == 'SUPER_ADMIN':
            return self.queryset.all()
        return self.queryset.filter(shop=user_profile.shop)

    def perform_create(self, serializer):
        user_profile = self.request.user.profile
        if user_profile.role == 'SUPER_ADMIN' and 'shop' in self.request.data:
            serializer.save()
        else:
            serializer.save(shop=user_profile.shop)

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [RolePermission]

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.role == 'SUPER_ADMIN':
            return Shop.objects.all()
        return Shop.objects.filter(id=user_profile.shop.id)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [RolePermission]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.role == 'SUPER_ADMIN':
            return User.objects.all()
        return User.objects.filter(profile__shop=user_profile.shop)

    def perform_create(self, serializer):
        user_profile = self.request.user.profile
        if user_profile.role == 'MANAGER':
            # Managers can only create Cashiers for their own shop
            serializer.save(role='CASHIER', shop=user_profile.shop.id)
        else:
            serializer.save()

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        shop = self.get_object()
        today = timezone.now().date()
        
        today_sales = Sale.objects.filter(shop=shop, timestamp__date=today)
        total_today_amount = sum(s.total_amount for s in today_sales)
        
        low_stock_count = Product.objects.filter(shop=shop, stock_quantity__lt=10).count()
        total_products = Product.objects.filter(shop=shop).count()
        total_sales_count = Sale.objects.filter(shop=shop).count()

        return Response({
            'todaySales': float(total_today_amount),
            'totalProducts': total_products,
            'lowStock': low_stock_count,
            'totalSalesCount': total_sales_count,
            'currency': shop.currency
        })

class CategoryViewSet(ShopFilteredViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

import csv
import io
from decimal import Decimal

class ProductViewSet(ShopFilteredViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decoded_file = file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            products_to_create = []
            shop = request.user.profile.shop
            
            for row in reader:
                # Basic validation
                name = row.get('name')
                buying_price = row.get('buying_price') or row.get('price') or '0'
                selling_price = row.get('selling_price') or row.get('price') or '0'
                if not name:
                    continue
                
                # Try to get or create category, brand, unit
                cat_name = row.get('category')
                category = None
                if cat_name:
                    category, _ = Category.objects.get_or_create(shop=shop, name=cat_name)
                
                brand_name = row.get('brand')
                brand = None
                if brand_name:
                    brand, _ = Brand.objects.get_or_create(shop=shop, name=brand_name)

                unit_name = row.get('unit')
                unit = None
                if unit_name:
                    unit, _ = Unit.objects.get_or_create(shop=shop, name=unit_name)

                products_to_create.append(Product(
                    shop=shop,
                    category=category,
                    brand=brand,
                    unit=unit,
                    name=name,
                    description=row.get('description', ''),
                    buying_price=Decimal(buying_price),
                    selling_price=Decimal(selling_price),
                    stock_quantity=int(row.get('stock', 0)),
                    barcode=row.get('barcode', '')
                ))
            
            Product.objects.bulk_create(products_to_create)
            return Response({'message': f'Successfully uploaded {len(products_to_create)} products'}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_barcode(self, request):
        barcode = request.query_params.get('barcode', None)
        if barcode:
            try:
                product = self.get_queryset().get(barcode=barcode)
                serializer = self.get_serializer(product)
                return Response(serializer.data)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Barcode not provided'}, status=status.HTTP_400_BAD_REQUEST)

class SaleViewSet(ShopFilteredViewSet):
    queryset = Sale.objects.all().order_by('-timestamp')
    serializer_class = SaleSerializer

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.role == 'SUPER_ADMIN':
            return Sale.objects.all().order_by('-timestamp')
        
        base_queryset = Sale.objects.filter(shop=user_profile.shop).order_by('-timestamp')
        
        if user_profile.role == 'CASHIER':
            return base_queryset.filter(cashier=self.request.user)
        
        return base_queryset

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        items_data = request.data.pop('items', [])
        payments_data = request.data.pop('payments', [])
        
        # Create the Sale instance
        # If selling_price includes tax, we should adjust total_amount if the frontend hasn't
        # But let's assume the frontend sends the inclusive total_amount.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sale = serializer.save(shop=request.user.profile.shop, cashier=request.user)

        # Create SaleItem instances and update stock
        for item_data in items_data:
            product_id = item_data.get('product')
            quantity = item_data.get('quantity')
            
            product = Product.objects.select_for_update().get(id=product_id, shop=request.user.profile.shop)
            if product.stock_quantity < quantity:
                raise serializers.ValidationError(f'Insufficient stock for {product.name}')
            
            product.stock_quantity -= quantity
            product.save()

            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=item_data.get('unit_price'),
                total_price=Decimal(str(item_data.get('unit_price'))) * quantity
            )

        # Create SalePayment instances
        for payment_data in payments_data:
            SalePayment.objects.create(
                sale=sale,
                method=payment_data.get('method'),
                amount=Decimal(str(payment_data.get('amount')))
            )

        # If no payments provided, create a default one based on payment_method
        if not payments_data:
            SalePayment.objects.create(
                sale=sale,
                method=sale.payment_method,
                amount=sale.total_amount
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SupplierViewSet(ShopFilteredViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class PurchaseViewSet(ShopFilteredViewSet):
    queryset = Purchase.objects.all().order_by('-purchase_date')
    serializer_class = PurchaseSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        items_data = self.request.data.get('items', [])
        purchase = serializer.save(shop=self.request.user.profile.shop)
        
        for item in items_data:
            product = Product.objects.get(id=item['product'], shop=self.request.user.profile.shop)
            quantity = item['quantity']
            
            # Update stock
            product.stock_quantity += quantity
            product.save()
            
            PurchaseItem.objects.create(
                purchase=purchase,
                product=product,
                quantity=quantity,
                unit_cost=item['unit_cost'],
                total_cost=Decimal(str(item['unit_cost'])) * quantity
            )

class ExpenseCategoryViewSet(ShopFilteredViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer

class ExpenseViewSet(ShopFilteredViewSet):
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer

class BrandViewSet(ShopFilteredViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class UnitViewSet(ShopFilteredViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class CustomerViewSet(ShopFilteredViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class StockAdjustmentViewSet(ShopFilteredViewSet):
    queryset = StockAdjustment.objects.all().order_by('-date')
    serializer_class = StockAdjustmentSerializer

class StockTransferViewSet(ShopFilteredViewSet):
    queryset = StockTransfer.objects.all().order_by('-date')
    serializer_class = StockTransferSerializer

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.role == 'SUPER_ADMIN':
            return self.queryset.all()
        # Filter by either shop_from or shop_to matching the user's shop
        return self.queryset.filter(
            Q(shop_from=user_profile.shop) | Q(shop_to=user_profile.shop)
        )

class SaleReturnViewSet(ShopFilteredViewSet):
    queryset = SaleReturn.objects.all().order_by('-date')
    serializer_class = SaleReturnSerializer
