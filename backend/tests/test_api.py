import os
from datetime import date

os.environ["DATABASE_URL"] = "sqlite:///./test_relog.db"
os.environ["JWT_SECRET"] = "test-secret"

from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_complete_mvp_flow():
    Base.metadata.drop_all(bind=engine)
    with TestClient(app) as client:
        register = client.post("/auth/register", json={"username": "tester", "password": "password123"})
        assert register.status_code == 201
        token = register.json()["access_token"]
        headers = auth_headers(token)

        tags = client.get("/emotion-tags", headers=headers)
        assert tags.status_code == 200
        tag_id = tags.json()[0]["emotion_tag_id"]

        created = client.post("/relationships", headers=headers, json={
            "name": "민지",
            "relation_type": "friend",
            "description": "오랜 친구",
            "start_date": "2020-01-01",
            "current_status": "active",
            "temperature_score": 72,
        })
        assert created.status_code == 201
        relationship_id = created.json()["relationship_id"]

        log = client.post(f"/relationships/{relationship_id}/logs", headers=headers, json={
            "log_date": date.today().isoformat(),
            "title": "점심 대화",
            "content": "서로의 근황을 나눴다.",
            "event_type": "conversation",
            "emotion_score": 3,
            "importance_score": 3,
            "emotion_tag_ids": [tag_id],
        })
        assert log.status_code == 201
        assert log.json()["emotion_tags"][0]["emotion_tag_id"] == tag_id

        relationship_list = client.get("/relationships", headers=headers)
        assert relationship_list.status_code == 200
        assert relationship_list.json()[0]["recent_log_date"] == date.today().isoformat()

        timeline = client.get(f"/relationships/{relationship_id}/timeline", headers=headers)
        assert timeline.status_code == 200
        assert timeline.json()[0]["title"] == "점심 대화"

        stats = client.get(f"/relationships/{relationship_id}/stats", headers=headers)
        assert stats.status_code == 200
        assert stats.json()["total_logs"] == 1
        assert stats.json()["average_emotion_score"] == 3

        dashboard = client.get("/dashboard/summary", headers=headers)
        assert dashboard.status_code == 200
        assert dashboard.json()["total_relationships"] == 1
        assert dashboard.json()["recent_logs"][0]["relationship_name"] == "민지"

        analysis = client.post(f"/relationships/{relationship_id}/ai-analysis", headers=headers)
        assert analysis.status_code == 200
        assert analysis.json()["eligible"] is False

        for index in range(9):
            response = client.post(f"/relationships/{relationship_id}/logs", headers=headers, json={
                "log_date": date.today().isoformat(),
                "title": f"추가 기록 {index + 1}",
                "content": "분석 기준을 확인하기 위한 기록입니다.",
                "event_type": "contact",
                "emotion_score": 0,
                "importance_score": 2,
                "emotion_tag_ids": [],
            })
            assert response.status_code == 201

        ready_analysis = client.post(f"/relationships/{relationship_id}/ai-analysis", headers=headers)
        assert ready_analysis.status_code == 200
        assert ready_analysis.json()["eligible"] is True
        report_id = ready_analysis.json()["report"]["report_id"]
        assert client.get(f"/ai-reports/{report_id}", headers=headers).status_code == 200

        updated = client.patch(f"/relationships/{relationship_id}", headers=headers, json={"temperature_score": 80})
        assert updated.status_code == 200
        assert updated.json()["temperature_score"] == 80


def test_validation_and_ownership():
    Base.metadata.drop_all(bind=engine)
    with TestClient(app) as client:
        first = client.post("/auth/register", json={"username": "firstuser", "password": "password123"}).json()
        second = client.post("/auth/register", json={"username": "seconduser", "password": "password123"}).json()
        created = client.post("/relationships", headers=auth_headers(first["access_token"]), json={
            "name": "소유 관계", "relation_type": "family", "temperature_score": 50,
        }).json()

        denied = client.get(f"/relationships/{created['relationship_id']}", headers=auth_headers(second["access_token"]))
        assert denied.status_code == 404

        invalid = client.post("/relationships", headers=auth_headers(first["access_token"]), json={
            "name": "잘못된 관계", "relation_type": "friend", "temperature_score": 101,
        })
        assert invalid.status_code == 422
