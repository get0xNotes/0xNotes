
FROM python:3.8-slim

RUN apt-get update && apt-get install -y git libpq-dev

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt

COPY . /app

CMD ["gunicorn"  , "-b", "0.0.0.0:5000", "app:app"]
