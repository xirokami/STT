from selenium import webdriver
from selenium.webdriver.common.by import By
import time

with open("C:/Users/SuperUser/Desktop/test.txt", "w") as f:
    f.write("")

driver = webdriver.Chrome()

try:
    driver.get("http://suninjuly.github.io/file_input.html")
    
    first_name = driver.find_element(By.NAME, "firstname")
    first_name.send_keys("Имя")
    
    last_name = driver.find_element(By.NAME, "lastname")
    last_name.send_keys("Фамилия")
    
    email = driver.find_element(By.NAME, "email")
    email.send_keys("email@example.com")
    
    file_input = driver.find_element(By.ID, "file")
    file_input.send_keys("C:/Users/SuperUser/Desktop/test.txt")
    
    submit_button = driver.find_element(By.CSS_SELECTOR, "button.btn")
    submit_button.click()
    
    time.sleep(30)
    
    alert = driver.switch_to.alert.text
    print(alert.split()[-1])
    driver.switch_to.alert.accept()

finally:
    driver.quit()
