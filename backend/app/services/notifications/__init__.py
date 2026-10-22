from typing import List, Dict, Any
from app.extensions import db
from app.models import Notification

class NotificationService:
    @staticmethod
    def send_notification(user_id: str, title: str, message: str, notification_type: str = "info", link_url: str = None) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            link_url=link_url
        )
        db.session.add(notif)
        db.session.commit()
        return notif

    @staticmethod
    def get_user_notifications(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(limit).all()
        return [n.to_dict() for n in notifs]

    @staticmethod
    def mark_as_read(notification_id: str, user_id: str) -> bool:
        notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        if notif:
            notif.is_read = True
            db.session.commit()
            return True
        return False
