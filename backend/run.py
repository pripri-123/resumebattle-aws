import os
from app import create_app
from app.extensions import db

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    
    # Auto create tables on run if not existing
    with app.app_context():
        db.create_all()
        
    print(f"[SERVER] Resume Battle 2.0 Backend running on http://localhost:{port}")
    app.run(host=host, port=port, debug=debug)
