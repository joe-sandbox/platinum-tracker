from pathlib import Path

from fastapi.testclient import TestClient

from platinum_tracker_api.config import Settings
from platinum_tracker_api.main import create_app


def test_health_check_initializes_local_storage(tmp_path: Path) -> None:
    settings = Settings(project_root=tmp_path)

    with TestClient(create_app(settings)) as client:
        response = client.get("/api/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    assert settings.resolved_data_dir.is_dir()
    assert settings.resolved_media_dir.is_dir()
    assert settings.resolved_source_dir.is_dir()
