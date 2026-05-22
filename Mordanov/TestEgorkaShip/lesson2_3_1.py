import math
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def calc(x):
    return str(math.log(abs(12*math.sin(int(x)))))

try:
    browser = webdriver.Chrome()
    browser.get("http://suninjuly.github.io/alert_accept.html")
    
    # Нажимаем на кнопку, которая вызывает confirm
    button = browser.find_element(By.CSS_SELECTOR, "button.btn")
    button.click()
    
    # Принимаем confirm
    confirm = browser.switch_to.alert
    confirm.accept()
    
    # Решаем капчу на новой странице
    x_element = browser.find_element(By.ID, "input_value")
    x = x_element.text
    y = calc(x)
    
    answer_field = browser.find_element(By.ID, "answer")
    answer_field.send_keys(y)
    
    submit_button = browser.find_element(By.CSS_SELECTOR, "button.btn")
    submit_button.click()

    # Получаем код из alert
    alert = browser.switch_to.alert
    alert_text = alert.text
    answer = alert_text.split(": ")[-1]
    print("Ответ:", answer)

finally:
    time.sleep(5)
    browser.quit()