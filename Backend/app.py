# app.py
import json
import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../Frontend/build', static_url_path='/')
CORS(app)  # разрешаем запросы с других доменов (для React в режиме разработки)

# Пути к JSON-файлам в папке data
TOPS_PATH = os.path.join(os.path.dirname(__file__), 'Data', 'TOPS.json')
GALLERY_PATH = os.path.join(os.path.dirname(__file__), 'Data', 'gallery.json')

@app.route('/api/tops', methods=['GET'])
def get_tops():
    """Эндпоинт, возвращающий список мест в формате JSON"""
    try:
        with open(TOPS_PATH, 'r', encoding='utf-8') as f:
            topsdata = json.load(f)
        return jsonify(topsdata)
    except FileNotFoundError:
        return jsonify({'error': 'Data file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    """Эндпоинт, возвращающий список мест в формате JSON"""
    try:
        with open(GALLERY_PATH, 'r', encoding='utf-8') as f:
            gallerydata = json.load(f)
        return jsonify(gallerydata)
    except FileNotFoundError:
        return jsonify({}), 404

# Маршрут для обслуживания статики React (после сборки)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Если запрашиваемый путь — файл, отдаём его из папки Frontend/build,
       иначе отдаём index.html (для клиентской маршрутизации React)"""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=False, port=5000)