from flask import Blueprint, jsonify
from app.security import token_required
from app.services.analytics import CareerAnalyticsService

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/v1/analytics')

@analytics_bp.route('/overview', methods=['GET'])
@token_required
def get_insights(current_user):
    data = CareerAnalyticsService.get_dashboard_insights(current_user.id)
    return jsonify({'insights': data}), 200
