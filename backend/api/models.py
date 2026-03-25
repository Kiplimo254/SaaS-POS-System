from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from django.core.files import File
import random
import string
from decimal import Decimal

class Shop(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    currency = models.CharField(max_length=10, default='Ksh')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.16)
    is_active = models.BooleanField(default=True)
    receipt_header = models.TextField(blank=True, null=True, help_text="Text shown at the top of receipts")
    receipt_footer = models.TextField(blank=True, null=True, help_text="Text shown at the bottom of receipts")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    ROLES = (
        ('SUPER_ADMIN', 'Super Admin'),
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('CASHIER', 'Cashier'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='users')
    role = models.CharField(max_length=20, choices=ROLES, default='CASHIER')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class Category(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.shop.name})"

class Brand(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='brands')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Unit(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='units')
    name = models.CharField(max_length=50)
    short_name = models.CharField(max_length=10)

    def __str__(self):
        return self.name

class Customer(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    points = models.PositiveIntegerField(default=0)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return self.name

class Product(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True) # Deprecated, use selling_price
    buying_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stock_quantity = models.PositiveIntegerField(default=0)
    alert_quantity = models.PositiveIntegerField(default=5)
    barcode = models.CharField(max_length=50, unique=True, blank=True)
    barcode_image = models.ImageField(upload_to='barcodes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.barcode:
            # Generate a random 12-digit barcode if not provided
            self.barcode = ''.join(random.choices(string.digits, k=12))
        
        # Generate barcode image if it doesn't exist
        if not self.barcode_image:
            EAN = barcode.get_barcode_class('ean13')
            # EAN13 needs 12 digits + 1 checksum digit (handled by the library)
            barcode_instance = EAN(self.barcode, writer=ImageWriter())
            buffer = BytesIO()
            barcode_instance.write(buffer)
            self.barcode_image.save(f'{self.barcode}.png', File(buffer), save=False)
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.barcode}"

class Supplier(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='suppliers')
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Purchase(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='purchases')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchases')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    purchase_date = models.DateTimeField(default=timezone.now)
    reference_no = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"Purchase {self.id} from {self.supplier.name}"

class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)

class Sale(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='sales')
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sales_processed')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=50, default='Cash')
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Sale {self.id} - {self.shop.name} - {self.total_amount}"

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        from decimal import Decimal
        self.unit_price = Decimal(str(self.unit_price))
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

class ExpenseCategory(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='expense_categories')
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Expense(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.category.name}: {self.amount}"

class StockAdjustment(models.Model):
    ADJUSTMENT_TYPES = (
        ('Addition', 'Addition'),
        ('Subtraction', 'Subtraction'),
    )
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='stock_adjustments')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    adjustment_type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPES)
    reason = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.id: # Pre-save current stock adjustment
            if self.adjustment_type == 'Addition':
                self.product.stock_quantity += self.quantity
            else:
                self.product.stock_quantity -= self.quantity
            self.product.save()
        super().save(*args, **kwargs)

class StockTransfer(models.Model):
    shop_from = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='transfers_sent')
    shop_to = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='transfers_received')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=(('Pending', 'Pending'), ('Completed', 'Completed')), default='Pending')
    date = models.DateTimeField(auto_now_add=True)

class SaleReturn(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='returns', null=True)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='returns')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    amount_refunded = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.id:
            if not self.shop:
                self.shop = self.sale.shop
            self.product.stock_quantity += self.quantity
            self.product.save()
        super().save(*args, **kwargs)

class SalePayment(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=50) # Cash, Mpesa, Bank
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method}: {self.amount} for Sale {self.sale.id}"
