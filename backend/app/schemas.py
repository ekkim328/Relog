from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


RelationType = Literal["friend", "lover", "family", "work", "school", "acquaintance", "etc"]
RelationshipStatus = Literal["active", "distant", "conflict", "ended", "unknown"]
EventType = Literal[
    "conversation", "conflict", "reconciliation", "promise", "gift", "contact",
    "avoidance", "help", "disappointment", "positive_event", "etc",
]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(ORMModel):
    user_id: int
    username: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RelationshipBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    relation_type: RelationType
    description: str | None = None
    start_date: date | None = None
    current_status: RelationshipStatus = "unknown"
    temperature_score: int = Field(default=50, ge=0, le=100)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("name must not be blank")
        return value.strip()


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    relation_type: RelationType | None = None
    description: str | None = None
    start_date: date | None = None
    current_status: RelationshipStatus | None = None
    temperature_score: int | None = Field(default=None, ge=0, le=100)

    @model_validator(mode="after")
    def required_fields_cannot_be_null(self):
        for field in ("name", "relation_type", "current_status", "temperature_score"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} must not be null")
        return self


class RelationshipOut(RelationshipBase, ORMModel):
    relationship_id: int
    created_at: datetime
    updated_at: datetime


class RelationshipListItem(RelationshipOut):
    recent_log_date: date | None = None


class EmotionTagOut(ORMModel):
    emotion_tag_id: int
    name: str
    category: Literal["positive", "negative", "neutral"]


class LogBase(BaseModel):
    log_date: date
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    event_type: EventType = "etc"
    emotion_score: int = Field(default=0, ge=-5, le=5)
    importance_score: int = Field(default=3, ge=1, le=5)
    my_action: str | None = None
    other_action: str | None = None
    result: str | None = None
    memo: str | None = None
    emotion_tag_ids: list[int] = Field(default_factory=list)


class LogCreate(LogBase):
    pass


class LogUpdate(BaseModel):
    log_date: date | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    event_type: EventType | None = None
    emotion_score: int | None = Field(default=None, ge=-5, le=5)
    importance_score: int | None = Field(default=None, ge=1, le=5)
    my_action: str | None = None
    other_action: str | None = None
    result: str | None = None
    memo: str | None = None
    emotion_tag_ids: list[int] | None = None

    @model_validator(mode="after")
    def required_fields_cannot_be_null(self):
        for field in ("log_date", "title", "content", "event_type", "emotion_score", "importance_score"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} must not be null")
        return self


class LogOut(ORMModel):
    log_id: int
    relationship_id: int
    log_date: date
    title: str
    content: str
    event_type: str
    emotion_score: int
    importance_score: int
    my_action: str | None
    other_action: str | None
    result: str | None
    memo: str | None
    emotion_tags: list[EmotionTagOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class RelationshipStats(BaseModel):
    total_logs: int
    recent_7_days_logs: int
    recent_30_days_logs: int
    average_emotion_score: float
    positive_logs: int
    negative_logs: int
    neutral_logs: int
    most_common_event_type: str | None
    last_log_date: date | None
    temperature_score: int


class DashboardRecentLog(BaseModel):
    log_id: int
    relationship_id: int
    relationship_name: str
    log_date: date
    title: str
    event_type: str
    emotion_score: int


class DashboardRelationship(BaseModel):
    relationship_id: int
    name: str
    temperature_score: int
    negative_log_count: int = 0


class DashboardSummary(BaseModel):
    total_relationships: int
    total_logs: int
    recent_7_days_logs: int
    recent_30_days_logs: int
    average_emotion_score: float
    recent_logs: list[DashboardRecentLog]
    low_temperature_relationships: list[DashboardRelationship]
    relationships_with_negative_logs: list[DashboardRelationship]


class AIReportOut(ORMModel):
    report_id: int
    relationship_id: int
    period_start: date | None
    period_end: date | None
    summary: str
    pattern_analysis: str
    risk_points: str
    suggested_actions: str
    confidence_score: float
    created_at: datetime


class AIAnalysisResponse(BaseModel):
    eligible: bool
    message: str | None = None
    report: AIReportOut | None = None
