import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Shop

def create_super_admin():
    print("Creating/Promoting Super Admin...")
    
    # Check if a shop exists, if not create a default one
    shop = Shop.objects.first()
    if not shop:
        print("No shop found. Creating a default shop...")
        shop = Shop.objects.create(
            name="Main Branch",
            currency="KSh",
            tax_rate=0.16
        )
        print(f"Created default shop: {shop.name}")

    # Create the superuser
    username = "admin"
    email = "admin@example.com"
    password = "adminpassword123!"

    user, created = User.objects.get_or_create(username=username, email=email)
    
    if created:
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Created new superuser: {username}")
    else:
        user.is_staff = True
        user.is_superuser = True
        # Always reset the password so we know exactly what it is
        user.set_password(password)
        user.save()
        print(f"Found existing user {username}, promoted to superuser and reset password.")

    # Create or update UserProfile
    profile, profile_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={'shop': shop, 'role': 'SUPER_ADMIN'}
    )
    
    if not profile_created:
        profile.role = 'SUPER_ADMIN'
        if not profile.shop:
            profile.shop = shop
        profile.save()
        print("Updated existing user profile to SUPER_ADMIN.")
    else:
        print("Created new UserProfile for super admin.")

    print("\n" + "="*40)
    print("SUCCESS! You can now log in.")
    print("="*40)
    print(f"URL:      Your Vercel Frontend URL")
    print(f"Username: {username}")
    print(f"Password: {password}")
    print("="*40)

if __name__ == '__main__':
    create_super_admin()
