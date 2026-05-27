import requests

def fetch_steam_appdetails(appid: int, lang: str = "schinese") -> dict | None:
    url = "https://store.steampowered.com/api/appdetails"
    params = {
        "appids": appid,
        "l": lang,
    }

    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()

    payload = resp.json()
    item = payload.get(str(appid))

    if not item or not item.get("success"):
        return None

    return item.get("data")


def get_localized_name(appid: int) -> str | None:
    data = fetch_steam_appdetails(appid, "schinese")
    if data and data.get("name"):
        return data["name"]

    # 中文没有就回退英文
    data = fetch_steam_appdetails(appid, "english")
    if data and data.get("name"):
        return data["name"]

    return None


appid = 3240220
name_zh = get_localized_name(appid)
print(name_zh)
