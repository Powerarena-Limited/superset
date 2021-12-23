import logging
import os
from datetime import timedelta
from cachelib.file import FileSystemCache
from celery.schedules import crontab
logger = logging.getLogger()


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

REDIS_HOST = get_env_variable("REDIS_HOST", "redis-superset")
REDIS_PORT = get_env_variable("REDIS_PORT", "6379")

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
SMTP_HOST = get_env_variable("SMTP_HOST", "localhost")
SMTP_STARTTLS = get_env_variable("SMTP_STARTTLS", True)
SMTP_SSL = get_env_variable("SMTP_SSL", False)
SMTP_USER = get_env_variable("SMTP_USER", "powerarena")
SMTP_PORT = get_env_variable("SMTP_PORT", 587)
SMTP_PASSWORD = get_env_variable("SMTP_PASSWORD", "password")
SMTP_MAIL_FROM = get_env_variable("SMTP_MAIL_FROM", "support@powerarena.com")

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


ENABLE_SCHEDULED_EMAIL_REPORTS = get_env_variable("ENABLE_SCHEDULED_EMAIL_REPORTS", True)
ENABLE_PROXY_FIX = True
