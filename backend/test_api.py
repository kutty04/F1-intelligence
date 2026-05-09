import requests, json

# Test 1: Grid stats
print("=== Test 1: Grid Stats ===")
r = requests.get("http://localhost:8000/api/v1/analytics/grid-stats")
print("Status:", r.status_code)
if r.status_code == 200:
    d = r.json()
    print("Circuits:", d["total_circuits"])
    print("Top:", d["stats"][0]["Circuit"], "=", d["stats"][0]["WinPct"], "%")
else:
    print(r.text[:200])

# Test 2: Laps endpoint (was crashing with NaN error)
print()
print("=== Test 2: Laps (was crashing) ===")
r2 = requests.get("http://localhost:8000/api/v1/laps/2024/Bahrain?session=R", timeout=120)
print("Status:", r2.status_code)
if r2.status_code == 200:
    d2 = r2.json()
    print("Total laps:", d2["total_laps"])
    first = d2["laps"][0]
    print("First lap driver:", first["Driver"], "| Sector1Sec:", first.get("Sector1Sec"))
else:
    print(r2.text[:300])

# Test 3: Fastest lap
print()
print("=== Test 3: Fastest Lap ===")
r3 = requests.get("http://localhost:8000/api/v1/laps/2024/Bahrain/fastest", timeout=120)
print("Status:", r3.status_code)
if r3.status_code == 200:
    print(json.dumps(r3.json(), indent=2))
else:
    print(r3.text[:200])
