import unittest

from models.nlu import extract_recipe_dish, extract_servings


class NluTests(unittest.TestCase):
    def test_ten_recipe_phrasings(self):
        cases = [
            ("make paneer butter masala for four people", "paneer butter masala", 4),
            ("cook biryani for 6 servings", "biryani", 6),
            ("prepare pasta for two persons", "pasta", 2),
            ("recipe for dosa for 3 people", "dosa", 3),
            ("ingredients for rajma for five people", "rajma", 5),
            ("i want to make poha for 2 servings", "poha", 2),
            ("i need to cook dal for 4 logon ke liye", "dal", 4),
            ("bake cake for eight people", "cake", 8),
            ("how to make idli", "idli", None),
            ("make chole", "chole", None),
        ]
        for phrase, dish, servings in cases:
            with self.subTest(phrase=phrase):
                self.assertEqual(extract_recipe_dish(phrase), dish)
                self.assertEqual(extract_servings(phrase), servings)


if __name__ == "__main__":
    unittest.main()
