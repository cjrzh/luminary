"""
游戏元数据爬取工具
功能：
  1. 通过 Steam Web API 获取已购买游戏清单
  2. 通过 Steam Store API + IGDB 获取每款游戏的完整元数据
  3. 支持单条测试 → 批量爬取
  4. 结果保存为 JSON + CSV
"""

import requests
import json
import time
import csv
import os
from datetime import datetime
from typing import Optional

# ─────────────────────────────────────────────
#  配置区：从环境变量读取，避免把密钥提交到仓库
# ─────────────────────────────────────────────
STEAM_API_KEY = os.getenv("STEAM_API_KEY", "")
STEAM_ID = os.getenv("STEAM_ID", "")

IGDB_CLIENT_ID = os.getenv("IGDB_CLIENT_ID", "")
IGDB_CLIENT_SECRET = os.getenv("IGDB_CLIENT_SECRET", "")

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def require_env(name: str, value: str) -> str:
    if not value:
        raise RuntimeError(f"请先设置环境变量 {name}")
    return value

# ─────────────────────────────────────────────
#  IGDB Token 管理
# ─────────────────────────────────────────────
_igdb_token_cache: dict = {}

def get_igdb_token() -> str:
    """获取 IGDB Access Token（自动缓存）"""
    global _igdb_token_cache
    now = time.time()
    if _igdb_token_cache.get("expires_at", 0) > now + 60:
        return _igdb_token_cache["token"]

    resp = requests.post(
        "https://id.twitch.tv/oauth2/token",
        params={
            "client_id": require_env("IGDB_CLIENT_ID", IGDB_CLIENT_ID),
            "client_secret": require_env("IGDB_CLIENT_SECRET", IGDB_CLIENT_SECRET),
            "grant_type": "client_credentials",
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    _igdb_token_cache = {
        "token": data["access_token"],
        "expires_at": now + data.get("expires_in", 3600),
    }
    print(f"[IGDB] Token 获取成功，有效期 {data.get('expires_in', 3600)//3600} 小时")
    return _igdb_token_cache["token"]


# ─────────────────────────────────────────────
#  Step 1：获取 Steam 已购买游戏清单
# ─────────────────────────────────────────────
def get_steam_owned_games() -> list[dict]:
    """返回已购买游戏列表，每项含 appid / name / playtime_forever 等"""
    print("\n[Steam] 正在获取已购买游戏清单...")
    steam_api_key = require_env("STEAM_API_KEY", STEAM_API_KEY)
    steam_id = require_env("STEAM_ID", STEAM_ID)
    url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    params = {
        "key": steam_api_key,
        "steamid": steam_id,
        "include_appinfo": 1,
        "include_played_free_games": 1,
        "format": "json",
    }
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    games = resp.json().get("response", {}).get("games", [])
    print(f"[Steam] 共找到 {len(games)} 款游戏")
    return games


# ─────────────────────────────────────────────
#  Step 2a：Steam Store API 元数据
# ─────────────────────────────────────────────
def fetch_steam_metadata(appid: int) -> Optional[dict]:
    """从 Steam Store API 获取单款游戏详细元数据"""
    url = "https://store.steampowered.com/api/appdetails"
    params = {"appids": appid, "l": "schinese"}
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json().get(str(appid), {})
        if not data.get("success"):
            return None
        d = data["data"]

        # 提取所有可用字段
        return {
            # 基本信息
            "steam_appid":        d.get("steam_appid"),
            "name":               d.get("name"),
            "type":               d.get("type"),
            "is_free":            d.get("is_free"),
            "short_description":  d.get("short_description"),
            "detailed_description": d.get("detailed_description"),
            "about_the_game":     d.get("about_the_game"),
            "supported_languages":d.get("supported_languages"),
            "website":            d.get("website"),
            # 媒体
            "header_image":       d.get("header_image"),
            "background":         d.get("background"),
            "screenshots": [s.get("path_full") for s in d.get("screenshots", [])],
            "movies":      [m.get("webm", {}).get("max") for m in d.get("movies", [])],
            # 分类标签
            "genres":      [g.get("description") for g in d.get("genres", [])],
            "categories":  [c.get("description") for c in d.get("categories", [])],
            # 开发/发行
            "developers":  d.get("developers", []),
            "publishers":  d.get("publishers", []),
            # 发行信息
            "release_date":       d.get("release_date", {}).get("date"),
            "coming_soon":        d.get("release_date", {}).get("coming_soon"),
            # 价格
            "price_currency":     d.get("price_overview", {}).get("currency"),
            "price_initial":      d.get("price_overview", {}).get("initial"),       # 原价（分）
            "price_final":        d.get("price_overview", {}).get("final"),         # 现价（分）
            "price_discount_pct": d.get("price_overview", {}).get("discount_percent"),
            # 评分
            "metacritic_score":   d.get("metacritic", {}).get("score"),
            "metacritic_url":     d.get("metacritic", {}).get("url"),
            "recommendations":    d.get("recommendations", {}).get("total"),
            # 平台
            "platforms":          d.get("platforms", {}),
            # PC配置
            "pc_requirements_minimum":      d.get("pc_requirements", {}).get("minimum"),
            "pc_requirements_recommended":  d.get("pc_requirements", {}).get("recommended"),
            # DLC / 附属
            "dlc":                d.get("dlc", []),
            "fullgame":           d.get("fullgame", {}),
            # 年龄分级
            "required_age":       d.get("required_age"),
            "content_descriptors":d.get("content_descriptors", {}).get("notes"),
            # 成就
            "achievements_total": d.get("achievements", {}).get("total"),
        }
    except Exception as e:
        print(f"  [Steam Store] appid={appid} 获取失败: {e}")
        return None


# ─────────────────────────────────────────────
#  Step 2b：IGDB 元数据
# ─────────────────────────────────────────────
def fetch_igdb_metadata(game_name: str, steam_appid: int) -> Optional[dict]:
    """从 IGDB 获取游戏元数据，优先用 Steam AppID 精确匹配"""
    token = get_igdb_token()
    headers = {
        "Client-ID": IGDB_CLIENT_ID,
        "Authorization": f"Bearer {token}",
    }

    # 优先通过 Steam AppID 匹配（最精确）
    query = f"""
        fields
            name, slug, summary, storyline,
            first_release_date,
            rating, rating_count,
            aggregated_rating, aggregated_rating_count,
            total_rating, total_rating_count,
            genres.name, themes.name,
            platforms.name, platforms.abbreviation,
            involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
            franchises.name, collections.name,
            game_modes.name, player_perspectives.name,
            keywords.name,
            cover.url,
            screenshots.url,
            videos.name, videos.video_id,
            websites.url, websites.category,
            age_ratings.rating, age_ratings.category,
            similar_games.name,
            dlcs.name, expansions.name,
            game_engines.name,
            status, category;
        where external_games.uid = "{steam_appid}" & external_games.category = 1;
        limit 1;
    """

    try:
        resp = requests.post(
            "https://api.igdb.com/v4/games",
            headers=headers,
            data=query,
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json()

        # fallback：用游戏名称搜索
        if not results:
            clean_name = game_name.replace('"', "")
            query_fallback = f"""
                fields
                    name, slug, summary, storyline,
                    first_release_date,
                    rating, rating_count,
                    aggregated_rating, aggregated_rating_count,
                    total_rating, total_rating_count,
                    genres.name, themes.name,
                    platforms.name, platforms.abbreviation,
                    involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
                    franchises.name, collections.name,
                    game_modes.name, player_perspectives.name,
                    keywords.name,
                    cover.url,
                    screenshots.url,
                    age_ratings.rating, age_ratings.category,
                    similar_games.name,
                    game_engines.name,
                    status, category;
                search "{clean_name}";
                limit 1;
            """
            resp2 = requests.post(
                "https://api.igdb.com/v4/games",
                headers=headers,
                data=query_fallback,
                timeout=10,
            )
            resp2.raise_for_status()
            results = resp2.json()

        if not results:
            return None

        g = results[0]

        def safe_list(key, subkey=None):
            items = g.get(key, [])
            if subkey:
                return [i.get(subkey, "") for i in items if isinstance(i, dict)]
            return items

        # 发行日期转换
        release_ts = g.get("first_release_date")
        release_date_str = (
            datetime.utcfromtimestamp(release_ts).strftime("%Y-%m-%d")
            if release_ts else None
        )

        # 封面 URL 转高清
        cover_url = g.get("cover", {}).get("url", "")
        if cover_url:
            cover_url = "https:" + cover_url.replace("t_thumb", "t_cover_big")

        # 截图 URL
        screenshots = [
            "https:" + s.get("url", "").replace("t_thumb", "t_screenshot_big")
            for s in g.get("screenshots", [])
        ]

        # 公司分类
        companies = g.get("involved_companies", [])
        developers  = [c["company"]["name"] for c in companies if c.get("developer")  and isinstance(c.get("company"), dict)]
        publishers  = [c["company"]["name"] for c in companies if c.get("publisher")  and isinstance(c.get("company"), dict)]

        # 网站
        websites = {
            {1: "official", 2: "wikia", 3: "wikipedia", 4: "facebook",
             5: "twitter", 6: "twitch", 8: "instagram", 9: "youtube",
             10: "iphone", 11: "ipad", 12: "android", 13: "steam",
             14: "reddit", 15: "itch", 16: "epicgames", 17: "gog"
             }.get(w.get("category"), f"site_{w.get('category')}"): w.get("url")
            for w in g.get("websites", [])
        }

        # IGDB 游戏分类枚举
        category_map = {
            0: "main_game", 1: "dlc", 2: "expansion", 3: "bundle",
            4: "standalone_expansion", 5: "mod", 6: "episode",
            7: "season", 8: "remake", 9: "remaster", 10: "expanded_game",
            11: "port", 12: "fork",
        }
        status_map = {
            0: "released", 2: "alpha", 3: "beta", 4: "early_access",
            5: "offline", 6: "cancelled", 7: "rumored",
        }

        return {
            "igdb_id":                    g.get("id"),
            "igdb_slug":                  g.get("slug"),
            "igdb_name":                  g.get("name"),
            "igdb_summary":               g.get("summary"),
            "igdb_storyline":             g.get("storyline"),
            "igdb_category":              category_map.get(g.get("category"), g.get("category")),
            "igdb_status":                status_map.get(g.get("status"), g.get("status")),
            "igdb_first_release_date":    release_date_str,
            "igdb_rating":                round(g["rating"], 1) if g.get("rating") else None,
            "igdb_rating_count":          g.get("rating_count"),
            "igdb_aggregated_rating":     round(g["aggregated_rating"], 1) if g.get("aggregated_rating") else None,
            "igdb_aggregated_rating_count": g.get("aggregated_rating_count"),
            "igdb_total_rating":          round(g["total_rating"], 1) if g.get("total_rating") else None,
            "igdb_total_rating_count":    g.get("total_rating_count"),
            "igdb_genres":                safe_list("genres", "name"),
            "igdb_themes":                safe_list("themes", "name"),
            "igdb_game_modes":            safe_list("game_modes", "name"),
            "igdb_player_perspectives":   safe_list("player_perspectives", "name"),
            "igdb_keywords":              safe_list("keywords", "name"),
            "igdb_platforms":             safe_list("platforms", "name"),
            "igdb_developers":            developers,
            "igdb_publishers":            publishers,
            "igdb_franchises":            safe_list("franchises", "name"),
            "igdb_collections":           safe_list("collections", "name"),
            "igdb_game_engines":          safe_list("game_engines", "name"),
            "igdb_cover_url":             cover_url,
            "igdb_screenshots":           screenshots,
            "igdb_videos":                [
                {"name": v.get("name"), "youtube_id": v.get("video_id")}
                for v in g.get("videos", [])
            ],
            "igdb_websites":              websites,
            "igdb_age_ratings":           [
                {"category": r.get("category"), "rating": r.get("rating")}
                for r in g.get("age_ratings", [])
            ],
            "igdb_similar_games":         safe_list("similar_games", "name"),
            "igdb_dlcs":                  safe_list("dlcs", "name"),
            "igdb_expansions":            safe_list("expansions", "name"),
        }

    except Exception as e:
        print(f"  [IGDB] {game_name} 获取失败: {e}")
        return None


# ─────────────────────────────────────────────
#  Step 3：合并单款游戏全量元数据
# ─────────────────────────────────────────────
def fetch_game_full_metadata(steam_game: dict) -> dict:
    """
    steam_game: Steam 游戏清单中的一条记录
    返回合并后的完整元数据
    """
    appid = steam_game["appid"]
    name  = steam_game.get("name", f"AppID_{appid}")

    print(f"\n  ▶ [{appid}] {name}")

    # Steam 基础信息（来自清单）
    base = {
        "platform":              "steam",
        "steam_appid":           appid,
        "steam_name":            name,
        "steam_playtime_min":    steam_game.get("playtime_forever", 0),
        "steam_playtime_hours":  round(steam_game.get("playtime_forever", 0) / 60, 1),
        "steam_playtime_2weeks": steam_game.get("playtime_2weeks", 0),
        "steam_img_icon_url":    steam_game.get("img_icon_url"),
        "fetched_at":            datetime.now().isoformat(),
    }

    # Steam Store 详细元数据
    print(f"    → 获取 Steam Store 元数据...")
    steam_meta = fetch_steam_metadata(appid)
    if steam_meta:
        base.update(steam_meta)
        print(f"    ✓ Steam Store 获取成功")
    else:
        print(f"    ✗ Steam Store 无数据（可能是 DLC 或下架游戏）")

    # Steam API 有频率限制，稍作等待
    time.sleep(1.5)

    # IGDB 补充元数据
    print(f"    → 获取 IGDB 元数据...")
    igdb_meta = fetch_igdb_metadata(name, appid)
    if igdb_meta:
        base.update(igdb_meta)
        print(f"    ✓ IGDB 获取成功（评分: {igdb_meta.get('igdb_total_rating', 'N/A')}）")
    else:
        print(f"    ✗ IGDB 无匹配数据")

    time.sleep(0.3)  # IGDB 4 req/s 限制
    return base


# ─────────────────────────────────────────────
#  保存结果
# ─────────────────────────────────────────────
def save_results(games_meta: list[dict], prefix: str = "games"):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # 保存 JSON（完整数据）
    json_path = os.path.join(OUTPUT_DIR, f"{prefix}_{timestamp}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(games_meta, f, ensure_ascii=False, indent=2)
    print(f"\n[保存] JSON → {json_path}")

    # 保存 CSV（扁平化，适合导入数据库或 Excel）
    csv_path = os.path.join(OUTPUT_DIR, f"{prefix}_{timestamp}.csv")
    if games_meta:
        # 收集所有可能的列名
        all_keys = []
        for g in games_meta:
            for k in g.keys():
                if k not in all_keys:
                    all_keys.append(k)

        with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction="ignore")
            writer.writeheader()
            for g in games_meta:
                # list/dict 字段转为 JSON 字符串
                row = {}
                for k, v in g.items():
                    row[k] = json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                writer.writerow(row)
        print(f"[保存] CSV  → {csv_path}")

    return json_path, csv_path


# ─────────────────────────────────────────────
#  主流程
# ─────────────────────────────────────────────
def run_single_test():
    """单条测试：取游戏列表第一条"""
    print("=" * 60)
    print("  模式：单条测试")
    print("=" * 60)

    games = get_steam_owned_games()
    if not games:
        print("[错误] 未获取到游戏，请检查 API Key 和 Steam ID，以及隐私设置")
        return

    test_game = games[0]
    print(f"\n测试游戏：[{test_game['appid']}] {test_game.get('name')}")

    result = fetch_game_full_metadata(test_game)

    print("\n" + "─" * 40)
    print("元数据预览（精简版）：")
    preview_fields = [
        "steam_name", "steam_playtime_hours",
        "genres", "developers", "publishers", "release_date",
        "metacritic_score", "recommendations",
        "igdb_total_rating", "igdb_genres", "igdb_themes",
        "igdb_game_modes", "igdb_franchises",
    ]
    for f in preview_fields:
        v = result.get(f)
        if v is not None:
            print(f"  {f:<30} {v}")

    save_results([result], prefix="test")
    print("\n[完成] 测试通过，可运行 run_batch() 进行批量爬取")
    return result


def run_batch(start: int = 0, limit: int = None, delay: float = 2.0):
    """
    批量爬取所有游戏元数据
    start: 从第几条开始（断点续爬用）
    limit: 最多爬取几条（None = 全部）
    delay: 每条之间额外等待秒数
    """
    print("=" * 60)
    print("  模式：批量爬取")
    print("=" * 60)

    games = get_steam_owned_games()
    if not games:
        print("[错误] 未获取到游戏列表")
        return

    # 按游玩时间排序（玩得多的优先）
    games.sort(key=lambda x: x.get("playtime_forever", 0), reverse=True)

    target = games[start:start + limit] if limit else games[start:]
    total  = len(target)
    print(f"\n计划爬取：{total} 款游戏（从第 {start+1} 条开始）")

    results = []
    failed  = []

    for i, game in enumerate(target, 1):
        print(f"\n[{i}/{total}] 进度 {i/total*100:.1f}%")
        try:
            meta = fetch_game_full_metadata(game)
            results.append(meta)
        except Exception as e:
            print(f"  [!] 爬取失败: {e}")
            failed.append({"appid": game["appid"], "name": game.get("name"), "error": str(e)})

        # 每 20 条自动保存一次进度
        if i % 20 == 0:
            save_results(results, prefix=f"batch_checkpoint_{start+i}")
            print(f"  [自动保存] 已完成 {len(results)} 条")

        time.sleep(delay)

    # 最终保存
    json_path, csv_path = save_results(results, prefix="batch_final")

    # 保存失败列表
    if failed:
        fail_path = os.path.join(OUTPUT_DIR, "failed_games.json")
        with open(fail_path, "w", encoding="utf-8") as f:
            json.dump(failed, f, ensure_ascii=False, indent=2)
        print(f"[失败列表] → {fail_path}（共 {len(failed)} 条）")

    print(f"\n[完成] 成功 {len(results)} / {total}，失败 {len(failed)}")
    return results


# ─────────────────────────────────────────────
#  入口
# ─────────────────────────────────────────────
if __name__ == "__main__":
    # ① 先跑单条测试
    run_single_test()

    # ② 测试没问题后，注释掉上面，改为批量
    # run_batch()

    # ③ 也可以只爬前 10 条看效果
    # run_batch(limit=10)

    # ④ 断点续爬（比如上次跑到第 50 条中断了）
    # run_batch(start=50)
