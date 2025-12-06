from flask import Flask, render_template

app = Flask(__name__, static_folder='static/dist', static_url_path='/static', template_folder='templates')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5001)
