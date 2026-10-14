import unittest

from models.scoring import affinity_score, sentiment_score


class ScoringTests(unittest.TestCase):
    def test_recent_repeat_purchase_scores_above_old_single_purchase(self):
        self.assertGreater(affinity_score(3, 3, 1), affinity_score(1, 3, 90))

    def test_sentiment_is_bounded_and_uses_rating(self):
        self.assertGreater(sentiment_score("fresh and excellent quality", 5), 0)
        self.assertLess(sentiment_score("stale and rotten", 1), 0)
        self.assertLessEqual(sentiment_score("good " * 20, 5), 1.0)


if __name__ == "__main__":
    unittest.main()
