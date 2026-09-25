def my_decorator(func):
    def wrapper():
        print("Действие до вызова функции")
        func()
        print("Действие после вызова функции")
    return wrapper

@my_decorator
def say_hello():
    print("Привет!")

say_hello()

for item in items
  <li>item</li>
endfor
