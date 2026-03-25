from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Shop, UserProfile, Category, Product, 
    Supplier, Purchase, PurchaseItem, 
    Sale, SaleItem, ExpenseCategory, Expense,
    Brand, Unit, Customer, StockAdjustment, 
    StockTransfer, SaleReturn, SalePayment
)

class TrimmedModelSerializer(serializers.ModelSerializer):
    """
    Sanitizes all incoming string fields by trimming whitespace.
    """
    def to_internal_value(self, data):
        # Pre-trim string values in data
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str):
                    data[key] = value.strip()
        return super().to_internal_value(data)

class UserProfileSerializer(TrimmedModelSerializer):
    shop_name = serializers.ReadOnlyField(source='shop.name')

    class Meta:
        model = UserProfile
        fields = ['role', 'shop', 'shop_name', 'phone']

class UserSerializer(TrimmedModelSerializer):
    profile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'profile']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update User instance
        for attr, value in validated_data.items():
            set_attr(instance, attr, value)
        instance.save()
        
        # Update UserProfile instance
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return instance

def set_attr(instance, attr, value):
    if attr == 'password':
        instance.set_password(value)
    else:
        setattr(instance, attr, value)

class UserCreateSerializer(TrimmedModelSerializer):
    role = serializers.CharField(write_only=True)
    shop = serializers.IntegerField(write_only=True, required=False)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'shop']

    def create(self, validated_data):
        role = validated_data.pop('role')
        shop_id = validated_data.pop('shop', None)
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        profile = user.profile
        profile.role = role
        if shop_id:
            profile.shop = Shop.objects.get(id=shop_id)
        profile.save()
        
        return user

class ShopSerializer(TrimmedModelSerializer):
    class Meta:
        model = Shop
        fields = '__all__'

class CategorySerializer(TrimmedModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}

class BrandSerializer(TrimmedModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}

class UnitSerializer(TrimmedModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}

class CustomerSerializer(TrimmedModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}

    def validate_email(self, value):
        if value and "@" not in value:
            raise serializers.ValidationError("Invalid email address.")
        return value

class ProductSerializer(TrimmedModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    brand_name = serializers.ReadOnlyField(source='brand.name')
    unit_name = serializers.ReadOnlyField(source='unit.name')
    
    class Meta:
        model = Product
        fields = [
            'id', 'shop', 'category', 'category_name', 'brand', 'brand_name',
            'unit', 'unit_name', 'name', 'description', 'buying_price', 'selling_price', 
            'stock_quantity', 'alert_quantity', 'barcode', 
            'barcode_image', 'created_at', 'updated_at'
        ]
        extra_kwargs = {'shop': {'required': False}}

    def validate_buying_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Buying price cannot be negative.")
        return value

    def validate_selling_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Selling price cannot be negative.")
        return value

class SupplierSerializer(TrimmedModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}

class PurchaseItemSerializer(TrimmedModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = PurchaseItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_cost', 'total_cost']

class PurchaseSerializer(TrimmedModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)
    supplier_name = serializers.ReadOnlyField(source='supplier.name')

    class Meta:
        model = Purchase
        fields = ['id', 'shop', 'supplier', 'supplier_name', 'total_amount', 'purchase_date', 'reference_no', 'items']

class SaleItemSerializer(TrimmedModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']

class SalePaymentSerializer(TrimmedModelSerializer):
    class Meta:
        model = SalePayment
        fields = ['id', 'method', 'amount', 'timestamp']

class SaleSerializer(TrimmedModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    payments = SalePaymentSerializer(many=True, read_only=True)
    cashier_name = serializers.ReadOnlyField(source='cashier.username')
    
    class Meta:
        model = Sale
        fields = ['id', 'shop', 'cashier', 'cashier_name', 'total_amount', 'tax_amount', 'discount_amount', 'payment_method', 'timestamp', 'items', 'payments']
        extra_kwargs = {
            'shop': {'required': False},
            'cashier': {'required': False}
        }

class ExpenseCategorySerializer(TrimmedModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}

class ExpenseSerializer(TrimmedModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Expense
        fields = ['id', 'shop', 'category', 'category_name', 'amount', 'description', 'date']
        extra_kwargs = {'shop': {'required': False}}

class StockAdjustmentSerializer(TrimmedModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = StockAdjustment
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}

class StockTransferSerializer(TrimmedModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    shop_from_name = serializers.ReadOnlyField(source='shop_from.name')
    shop_to_name = serializers.ReadOnlyField(source='shop_to.name')

    class Meta:
        model = StockTransfer
        fields = '__all__'

class SaleReturnSerializer(TrimmedModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = SaleReturn
        fields = '__all__'
        extra_kwargs = {'shop': {'required': False}}
