from flask import Flask, render_template, jsonify

app = Flask(__name__, template_folder="template")
products = {
  "id1": {
    "img": "bald.png", "title": "roblox", "price": "15$"
  },
  "id2": {
    "img": "img.png", "title": "ibsatl", "price": "15$"
  }
}

@app.route("/")
def index():
  return render_template("index.html")

@app.route("/get")
def get():
  return jsonify(products)

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5000, debug=True)
