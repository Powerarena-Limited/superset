import logging
import os
from datetime import timedelta
from cachelib.file import FileSystemCache
from celery.schedules import crontab
logger = logging.getLogger()

# Flask-WTF flag for CSRF
WTF_CSRF_ENABLED = True
# Add endpoints that need to be exempt from CSRF protection
WTF_CSRF_EXEMPT_LIST = []
# A CSRF token that expires in 1 year
WTF_CSRF_TIME_LIMIT = 60 * 60 * 24 * 365

def get_env_variable(var_name, default=None):
    """Get the environment variable or raise exception."""
    try:
        return os.environ[var_name]
    except KeyError:
        if default is not None:
            return default
        else:
            error_msg = "The environment variable {} was missing, abort...".format(
                var_name
            )
            raise EnvironmentError(error_msg)


FEATURE_FLAGS = {
    "ALERT_REPORTS": True
}

REDIS_HOST = get_env_variable("REDIS_HOST", "superset-redis")
REDIS_PORT = get_env_variable("REDIS_PORT", "6379")
SQLALCHEMY_DATABASE_URI = get_env_variable("SQLALCHEMY_DATABASE_URI", "postgresql+psycopg2://superset:superset@superset-db/superset")

class CeleryConfig:
    BROKER_URL = 'redis://%s:%s/0' % (REDIS_HOST, REDIS_PORT)
    CELERY_IMPORTS = ('superset.sql_lab', "superset.tasks", "superset.tasks.thumbnails", )
    CELERY_RESULT_BACKEND = 'redis://%s:%s/0' % (REDIS_HOST, REDIS_PORT)
    CELERYD_PREFETCH_MULTIPLIER = 10
    CELERY_ACKS_LATE = True
    CELERY_ANNOTATIONS = {
        'sql_lab.get_sql_results': {
            'rate_limit': '100/s',
        },
        'email_reports.send': {
            'rate_limit': '1/s',
            'time_limit': 600,
            'soft_time_limit': 600,
            'ignore_result': True,
        },
    }
    CELERYBEAT_SCHEDULE = {
        'reports.scheduler': {
            'task': 'reports.scheduler',
            'schedule': crontab(minute='*', hour='*'),
        },
        'reports.prune_log': {
            'task': 'reports.prune_log',
            'schedule': crontab(minute=0, hour=0),
        },
    }
CELERY_CONFIG = CeleryConfig

SCREENSHOT_LOCATE_WAIT = get_env_variable("SCREENSHOT_LOCATE_WAIT", 100)
SCREENSHOT_LOAD_WAIT = get_env_variable("SCREENSHOT_LOAD_WAIT", 600)

# Slack configuration
SLACK_API_TOKEN = get_env_variable("SLACK_API_TOKEN", "slack-api-token")

# Email configuration
SMTP_HOST = get_env_variable("SMTP_HOST", "smtpdm-ap-southeast-1.aliyun.com")
SMTP_STARTTLS = get_env_variable("SMTP_STARTTLS", False)
SMTP_SSL = get_env_variable("SMTP_SSL", True)
SMTP_USER = get_env_variable("SMTP_USER", "noreply@mailer.powerarena.com")
SMTP_PORT = get_env_variable("SMTP_PORT", 465)
SMTP_PASSWORD = get_env_variable("SMTP_PASSWORD", "AliPay3427")
SMTP_MAIL_FROM = get_env_variable("SMTP_MAIL_FROM", "PowerArena Team <noreply@mailer.powerarena.com>")

WEBDRIVER_TYPE = "chrome"
WEBDRIVER_OPTION_ARGS = [
    "--force-device-scale-factor=2.0",
    "--high-dpi-support=2.0",
    "--headless",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-extensions",
]
THUMBNAIL_SELENIUM_USER = get_env_variable("THUMBNAIL_SELENIUM_USER", "admin")
EMAIL_NOTIFICATIONS = True
EMAIL_REPORTS_USER = get_env_variable("EMAIL_REPORTS_USER" ,"admin")
EMAIL_REPORTS_PASSWORD = get_env_variable("EMAIL_REPORTS_PASSWORD", "admin")
WEBDRIVER_BASEURL = get_env_variable("WEBDRIVER_BASEURL", "http://superset:8088/")
WEBDRIVER_BASEURL_USER_FRIENDLY = get_env_variable("WEBDRIVER_BASEURL_USER_FRIENDLY", WEBDRIVER_BASEURL)
# ENABLE_SCHEDULED_EMAIL_REPORTS = get_env_variable("ENABLE_SCHEDULED_EMAIL_REPORTS", True)


ENABLE_PROXY_FIX = True
