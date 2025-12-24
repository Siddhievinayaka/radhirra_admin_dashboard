from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer for admin users only"""
    
    def validate(self, attrs):
        # Authenticate user
        user = authenticate(
            request=self.context.get('request'),
            username=attrs['email'],  # Use email as username
            password=attrs['password']
        )
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        # Check if user is admin (staff or superuser)
        if not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError('Access denied. Admin privileges required.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        
        # Get tokens
        data = super().validate(attrs)
        
        # Add user info to response
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
        
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        
        return token


class AdminTokenObtainPairView(TokenObtainPairView):
    """Custom JWT view for admin login"""
    serializer_class = AdminTokenObtainPairSerializer