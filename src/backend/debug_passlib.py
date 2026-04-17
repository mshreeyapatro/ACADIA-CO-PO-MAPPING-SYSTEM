from passlib.context import CryptContext
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    h = pwd_context.hash("test")
    print("Hash successful:", h)
except Exception as e:
    import traceback
    traceback.print_exc()
