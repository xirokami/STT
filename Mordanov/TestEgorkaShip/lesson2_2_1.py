from selenium import webdriver
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()

try:
    driver.get("https://suninjuly.github.io/selects1.html")

    num1_element = driver.find_element(By.ID, "num1")
    num2_element = driver.find_element(By.ID, "num2")

    num1 = int(num1_element.text)
    num2 = int(num2_element.text)

    total_sum = num1 + num2

    select_element = Select(driver.find_element(By.TAG_NAME, "select"))

    select_element.select_by_visible_text(str(total_sum))

    submit_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button"))
    )
    submit_button.click()

    alert = WebDriverWait(driver, 10).until(EC.alert_is_present())
    result = alert.text
    print(result.split()[-1])  
    alert.accept()  

finally:
    driver.quit()


   
