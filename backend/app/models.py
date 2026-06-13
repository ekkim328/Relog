from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Table, Text, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


log_emotion_tags = Table(
    "log_emotion_tags",
    Base.metadata,
    Column("log_id", ForeignKey("relationship_logs.log_id", ondelete="CASCADE"), primary_key=True),
    Column("emotion_tag_id", ForeignKey("emotion_tags.emotion_tag_id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    relationships: Mapped[list["Relationship"]] = orm_relationship(back_populates="user", cascade="all, delete-orphan")


class Relationship(Base):
    __tablename__ = "relationships"

    relationship_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    relation_type: Mapped[str] = mapped_column(String(30))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    current_status: Mapped[str] = mapped_column(String(30), default="unknown")
    temperature_score: Mapped[int] = mapped_column(Integer, default=50)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped[User] = orm_relationship(back_populates="relationships")
    logs: Mapped[list["RelationshipLog"]] = orm_relationship(back_populates="relationship", cascade="all, delete-orphan")
    reports: Mapped[list["AIAnalysisReport"]] = orm_relationship(back_populates="relationship", cascade="all, delete-orphan")


class RelationshipLog(Base):
    __tablename__ = "relationship_logs"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    relationship_id: Mapped[int] = mapped_column(ForeignKey("relationships.relationship_id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), index=True)
    log_date: Mapped[date] = mapped_column(Date, index=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    event_type: Mapped[str] = mapped_column(String(40), default="etc")
    emotion_score: Mapped[int] = mapped_column(Integer, default=0)
    importance_score: Mapped[int] = mapped_column(Integer, default=3)
    my_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    other_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    result: Mapped[str | None] = mapped_column(Text, nullable=True)
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    relationship: Mapped[Relationship] = orm_relationship(back_populates="logs")
    emotion_tags: Mapped[list["EmotionTag"]] = orm_relationship(secondary=log_emotion_tags, back_populates="logs")


class EmotionTag(Base):
    __tablename__ = "emotion_tags"

    emotion_tag_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    category: Mapped[str] = mapped_column(String(20), index=True)

    logs: Mapped[list[RelationshipLog]] = orm_relationship(secondary=log_emotion_tags, back_populates="emotion_tags")


class AIAnalysisReport(Base):
    __tablename__ = "ai_analysis_reports"

    report_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    relationship_id: Mapped[int] = mapped_column(ForeignKey("relationships.relationship_id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), index=True)
    period_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    period_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    summary: Mapped[str] = mapped_column(Text)
    pattern_analysis: Mapped[str] = mapped_column(Text)
    risk_points: Mapped[str] = mapped_column(Text)
    suggested_actions: Mapped[str] = mapped_column(Text)
    confidence_score: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    relationship: Mapped[Relationship] = orm_relationship(back_populates="reports")
