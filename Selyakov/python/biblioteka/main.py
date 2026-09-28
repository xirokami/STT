from flask import Flask, render_template, jsonify, request

app = Flask(__name__, template_folder="template")
products = {
  "0": {
    "img": "bald.png", "title": "roblox", "price": "15$"
  },
  "1": {
    "img": "img.png", "title": "ibsatl", "price": "15$"
  }
}

@app.route("/")
def index():
  return render_template("index.html")

@app.route("/get")
def get():
  return jsonify(products)

@app.route("/edit/<id>", methods=["PUT"])
def edit(id):
  data = request.get_json()
  products[id] = data
  return jsonify(products[id])

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5000, debug=True)
