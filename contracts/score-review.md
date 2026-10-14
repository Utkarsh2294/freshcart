# `POST /score-review`

Request: `{"review_text":"fresh and excellent quality","rating":5}`. Rating is
optional; text is required and limited to 5,000 characters.

Response: `{"sentiment_score":0.8333}` where the score is always between -1 and
1. The service is self-hosted and makes no external API call.
