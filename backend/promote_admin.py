import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def promote():
    try:
        user = User.objects.get(username='admin')
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.role = 'SUPER_ADMIN'
        profile.save()
        print(f"Successfully promoted {user.username} to SUPER_ADMIN")
    except User.DoesNotExist:
        print("Admin user not found. Please create it first.")

if __name__ == "__main__":
    promote()
