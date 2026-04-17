from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
