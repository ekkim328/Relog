from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import EmotionTag


EMOTION_TAGS = {
    "positive": ["기쁨", "안정감", "고마움", "편안함", "설렘"],
    "negative": ["서운함", "분노", "불안", "실망", "의심"],
    "neutral": ["혼란", "애매함", "무덤덤함"],
}


def seed_emotion_tags(db: Session) -> None:
    existing = set(db.scalars(select(EmotionTag.name)))
    for category, names in EMOTION_TAGS.items():
        for name in names:
            if name not in existing:
                db.add(EmotionTag(name=name, category=category))
    db.commit()

