from src.predictor import _canonical_category, _keyword_category, _keyword_priority


def test_keyword_category_handles_short_complaints():
    assert _keyword_category("fire") == "Electrical"
    assert _keyword_category("electricity") == "Electrical"
    assert _keyword_category("water not coming") == "Plumbing"


def test_keyword_priority_marks_safety_issues_high():
    assert _keyword_priority("fire") == "HIGH"
    assert _keyword_priority("exposed wire in lab") == "HIGH"
    assert _keyword_priority("pipe burst in bathroom") == "HIGH"
    assert _keyword_priority("minor suggestion for notice board") == "LOW"


def test_model_category_names_are_frontend_compatible():
    assert _canonical_category("Electricity") == "Electrical"
    assert _canonical_category("Water") == "Plumbing"
    assert _canonical_category("Network") == "IT"
    assert _canonical_category("Sanitation") == "Cleaning"
    assert _canonical_category("Furniture") == "Maintenance"
