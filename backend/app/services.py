from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .models import AIAnalysisReport, EmotionTag, Relationship, RelationshipLog, User


def get_owned_relationship(db: Session, relationship_id: int, user: User) -> Relationship:
    relationship = db.scalar(
        select(Relationship).where(
            Relationship.relationship_id == relationship_id,
            Relationship.user_id == user.user_id,
        )
    )
    if not relationship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="관계를 찾을 수 없습니다.")
    return relationship


def get_owned_log(db: Session, log_id: int, user: User) -> RelationshipLog:
    log = db.scalar(
        select(RelationshipLog)
        .options(selectinload(RelationshipLog.emotion_tags))
        .where(RelationshipLog.log_id == log_id, RelationshipLog.user_id == user.user_id)
    )
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="기록을 찾을 수 없습니다.")
    return log


def get_owned_report(db: Session, report_id: int, user: User) -> AIAnalysisReport:
    report = db.scalar(
        select(AIAnalysisReport).where(
            AIAnalysisReport.report_id == report_id,
            AIAnalysisReport.user_id == user.user_id,
        )
    )
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="분석 리포트를 찾을 수 없습니다.")
    return report


def resolve_emotion_tags(db: Session, tag_ids: list[int]) -> list[EmotionTag]:
    if not tag_ids:
        return []
    unique_ids = set(tag_ids)
    tags = list(db.scalars(select(EmotionTag).where(EmotionTag.emotion_tag_id.in_(unique_ids))))
    if len(tags) != len(unique_ids):
        raise HTTPException(status_code=422, detail="존재하지 않는 감정 태그가 포함되어 있습니다.")
    return tags

