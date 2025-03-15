from datetime import datetime
from typing import List, Optional



class User:
    def __init__(self, id: int, email: str, hashed_password: str):
        self.id = id
        self.email = email
        self.hashed_password = hashed_password


class Test:
    def __init__(self, id: int, title: str, subject: str, duration: int):
        self.id = id
        self.title = title
        self.subject = subject
        self.duration = duration
        self.questions: List[Question] = []


class Question:
    def __init__(self, id: int, text: str, options: str, correct_answer: int, test_id: int):
        self.id = id
        self.text = text
        self.options = options
        self.correct_answer = correct_answer
        self.test_id = test_id


class TestResult:
    def __init__(self, id: int, user_id: int, test_id: int, score: float, time_spent: int, submitted_at: datetime):
        self.id = id
        self.user_id = user_id
        self.test_id = test_id
        self.score = score
        self.time_spent = time_spent
        self.submitted_at = submitted_at
        self.answers: List[UserAnswer] = []


class UserAnswer:
    def __init__(self, id: int, test_result_id: int, question_id: int, selected_option: int):
        self.id = id
        self.test_result_id = test_result_id
        self.question_id = question_id
        self.selected_option = selected_option
