from flask import Flask, request, jsonify
from db import listings_collection
from model import haversine
from bson import ObjectId
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # if frontend needs to hit this

@app.route('/find-match', methods=['POST'])
def find_match():
    try:
        data = request.get_json()

        size = data['size']
        gender = data['gender']
        owner_id = data['owner_id']
        latitude = data['latitude']
        longitude = data['longitude']

        max_distance_km = 20  # or 50 if you want wider reach
        max_results = 5       # number of matches to return

        listings = listings_collection.find({
            "size": size,
            "gender": gender,
            "available": True,
            "owner_id": { "$ne": owner_id }
        })

        matches = []

        for item in listings:
            coords = item['location']['coordinates']
            lon, lat = coords[0], coords[1]

            distance = haversine(latitude, longitude, lat, lon)

            if distance <= max_distance_km:
                item["_id"] = str(item["_id"])
                item["distance_km"] = round(distance, 2)
                matches.append(item)

        # Sort by distance and limit to top 5 matches
        matches = sorted(matches, key=lambda x: x["distance_km"])[:max_results]

        if not matches:
            return jsonify({"message": "No matches found nearby."}), 200

        return jsonify({"matches": matches}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Server error"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8000)
