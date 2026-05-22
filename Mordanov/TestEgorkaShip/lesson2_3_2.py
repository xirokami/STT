import math
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def calc(x):
    return str(math.log(abs(12*math.sin(int(x)))))

try:
    browser = webdriver.Chrome()
    browser.get("http://suninjuly.github.io/redirect_accept.html")
    
    # Нажимаем на кнопку, которая открывает новую вкладку
    button = browser.find_element(By.CSS_SELECTOR, "button.btn")
    button.click()
    
    # Переключаемся на новую вкладку
    new_window = browser.window_handles[1]
    browser.switch_to.window(new_window)
    
    # Решаем капчу на новой вкладке
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