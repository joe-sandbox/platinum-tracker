from typing import cast

from fastapi.testclient import TestClient


def create_game(client: TestClient, title: str = "Test Game") -> dict[str, object]:
    response = client.post(
        "/api/games",
        json={
            "title": title,
            "platform": "PlayStation 5",
            "edition": "Standard",
            "cover_image_url": None,
        },
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def create_guide(
    client: TestClient,
    game_id: str,
    title: str = "Test Guide",
) -> dict[str, object]:
    response = client.post(
        "/api/guides",
        json={
            "game_id": game_id,
            "title": title,
            "description": "Collect everything.",
            "source_url": None,
            "source_name": None,
        },
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def create_chapter(client: TestClient, guide_id: str) -> dict[str, object]:
    response = client.post(
        "/api/chapters",
        json={
            "guide_id": guide_id,
            "title": "Chapter 1",
            "description": "The beginning.",
        },
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def create_section(client: TestClient, chapter_id: str) -> dict[str, object]:
    response = client.post(
        "/api/sections",
        json={
            "chapter_id": chapter_id,
            "title": "Opening",
            "description": None,
        },
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def create_collectible_type(
    client: TestClient,
    guide_id: str,
) -> dict[str, object]:
    response = client.post(
        "/api/collectible-types",
        json={
            "guide_id": guide_id,
            "name": "Document",
            "color": "amber",
            "icon": "file-text",
        },
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def create_collectible(
    client: TestClient,
    section_id: str,
    collectible_type_id: str,
) -> dict[str, object]:
    response = client.post(
        "/api/collectibles",
        json={
            "section_id": section_id,
            "collectible_type_id": collectible_type_id,
            "title": "Captain's Log",
            "description": "On the desk.",
            "source_url": "https://example.com/log",
        },
    )
    assert response.status_code == 201
    return cast(dict[str, object], response.json())


def test_game_crud(api_client: TestClient) -> None:
    game = create_game(api_client)
    game_id = str(game["id"])

    assert game["title"] == "Test Game"
    assert api_client.get(f"/api/games/{game_id}").json() == game
    assert api_client.get("/api/games").json() == [game]

    update_response = api_client.put(
        f"/api/games/{game_id}",
        json={
            "title": "Updated Game",
            "platform": "PlayStation 4",
            "edition": None,
            "cover_image_url": "https://example.com/cover.jpg",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Game"
    assert update_response.json()["cover_image_url"] == (
        "https://example.com/cover.jpg"
    )

    assert api_client.delete(f"/api/games/{game_id}").status_code == 204
    assert api_client.get(f"/api/games/{game_id}").status_code == 404


def test_guide_crud_and_game_filter(api_client: TestClient) -> None:
    first_game = create_game(api_client, "First Game")
    second_game = create_game(api_client, "Second Game")
    guide = create_guide(api_client, str(first_game["id"]))
    guide_id = str(guide["id"])

    assert api_client.get(f"/api/guides/{guide_id}").json() == guide
    assert api_client.get(
        "/api/guides",
        params={"game_id": first_game["id"]},
    ).json() == [guide]
    assert (
        api_client.get(
            "/api/guides",
            params={"game_id": second_game["id"]},
        ).json()
        == []
    )

    update_response = api_client.put(
        f"/api/guides/{guide_id}",
        json={
            "game_id": second_game["id"],
            "title": "Updated Guide",
            "description": None,
            "source_url": "https://example.com/guide",
            "source_name": "Example",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["game_id"] == second_game["id"]
    assert update_response.json()["title"] == "Updated Guide"

    assert api_client.delete(f"/api/guides/{guide_id}").status_code == 204
    assert api_client.get(f"/api/guides/{guide_id}").status_code == 404


def test_deleting_game_cascades_to_guides(api_client: TestClient) -> None:
    game = create_game(api_client)
    guide = create_guide(api_client, str(game["id"]))

    assert api_client.delete(f"/api/games/{game['id']}").status_code == 204
    assert api_client.get(f"/api/guides/{guide['id']}").status_code == 404


def test_crud_validation_and_missing_parents(api_client: TestClient) -> None:
    invalid_game = api_client.post(
        "/api/games",
        json={"title": "   "},
    )
    missing_game_guide = api_client.post(
        "/api/guides",
        json={
            "game_id": "00000000-0000-4000-8000-000000000000",
            "title": "Guide",
        },
    )

    assert invalid_game.status_code == 422
    assert missing_game_guide.status_code == 404


def test_cors_allows_loopback_frontend(api_client: TestClient) -> None:
    response = api_client.options(
        "/api/games",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ("http://127.0.0.1:5173")


def test_guide_content_crud_and_positions(api_client: TestClient) -> None:
    game = create_game(api_client)
    guide = create_guide(api_client, str(game["id"]))
    chapter = create_chapter(api_client, str(guide["id"]))
    second_chapter = create_chapter(api_client, str(guide["id"]))
    section = create_section(api_client, str(chapter["id"]))
    collectible_type = create_collectible_type(api_client, str(guide["id"]))
    collectible = create_collectible(
        api_client,
        str(section["id"]),
        str(collectible_type["id"]),
    )

    assert chapter["position"] == 1
    assert second_chapter["position"] == 2
    assert api_client.get(f"/api/chapters/{chapter['id']}").json() == chapter
    assert api_client.get("/api/chapters", params={"guide_id": guide["id"]}).json() == [
        chapter,
        second_chapter,
    ]
    assert api_client.get(
        "/api/sections", params={"chapter_id": chapter["id"]}
    ).json() == [section]
    assert api_client.get(
        "/api/collectible-types", params={"guide_id": guide["id"]}
    ).json() == [collectible_type]
    assert api_client.get(
        "/api/collectibles", params={"section_id": section["id"]}
    ).json() == [collectible]

    updated = api_client.put(
        f"/api/collectibles/{collectible['id']}",
        json={
            "section_id": section["id"],
            "collectible_type_id": collectible_type["id"],
            "title": "Updated Log",
            "description": None,
            "source_url": None,
        },
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated Log"
    assert updated.json()["position"] == 1

    assert (
        api_client.delete(f"/api/collectibles/{collectible['id']}").status_code == 204
    )
    assert (
        api_client.delete(
            f"/api/collectible-types/{collectible_type['id']}"
        ).status_code
        == 204
    )
    assert api_client.delete(f"/api/chapters/{chapter['id']}").status_code == 204
    assert api_client.get(f"/api/sections/{section['id']}").status_code == 404


def test_collectible_requires_type_from_same_guide(api_client: TestClient) -> None:
    first_game = create_game(api_client, "First")
    second_game = create_game(api_client, "Second")
    first_guide = create_guide(api_client, str(first_game["id"]), "First Guide")
    second_guide = create_guide(api_client, str(second_game["id"]), "Second Guide")
    chapter = create_chapter(api_client, str(first_guide["id"]))
    section = create_section(api_client, str(chapter["id"]))
    other_type = create_collectible_type(api_client, str(second_guide["id"]))

    response = api_client.post(
        "/api/collectibles",
        json={
            "section_id": section["id"],
            "collectible_type_id": other_type["id"],
            "title": "Invalid",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == (
        "Section and collectible type must belong to the same guide"
    )


def test_type_in_use_cannot_be_deleted(api_client: TestClient) -> None:
    game = create_game(api_client)
    guide = create_guide(api_client, str(game["id"]))
    chapter = create_chapter(api_client, str(guide["id"]))
    section = create_section(api_client, str(chapter["id"]))
    collectible_type = create_collectible_type(api_client, str(guide["id"]))
    create_collectible(
        api_client,
        str(section["id"]),
        str(collectible_type["id"]),
    )

    response = api_client.delete(f"/api/collectible-types/{collectible_type['id']}")

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Cannot delete a collectible type that is in use"
    )


def test_deleting_guide_cascades_through_content(api_client: TestClient) -> None:
    game = create_game(api_client)
    guide = create_guide(api_client, str(game["id"]))
    chapter = create_chapter(api_client, str(guide["id"]))
    section = create_section(api_client, str(chapter["id"]))
    collectible_type = create_collectible_type(api_client, str(guide["id"]))
    collectible = create_collectible(
        api_client,
        str(section["id"]),
        str(collectible_type["id"]),
    )

    assert api_client.delete(f"/api/guides/{guide['id']}").status_code == 204
    assert api_client.get(f"/api/chapters/{chapter['id']}").status_code == 404
    assert api_client.get(f"/api/sections/{section['id']}").status_code == 404
    assert (
        api_client.get(f"/api/collectible-types/{collectible_type['id']}").status_code
        == 404
    )
    assert api_client.get(f"/api/collectibles/{collectible['id']}").status_code == 404
