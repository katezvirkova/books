from django.contrib.auth.models import User
from rest_framework import serializers
import re

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_check = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'password_check']

    def validate(self, data):
        required_fields = ['username', 'first_name', 'last_name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: f"{field.capitalize()} is required."})

        if data['password'] != data['password_check']:
            raise serializers.ValidationError("Passwords do not match.")

        if len(data['password']) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")

        if not re.search(r'\d', data['password']) or not re.search(r'[A-Za-z]', data['password']):
            raise serializers.ValidationError("Password must contain at least one letter and one number.")

        return data

    def create(self, validated_data):
        validated_data.pop('password_check')
        user = User.objects.create_user(**validated_data)
        return user
