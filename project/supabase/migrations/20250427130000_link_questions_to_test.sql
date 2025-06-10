-- Link questions to the test
INSERT INTO test_questions (test_id, question_id, question_order)
VALUES 
  ('a1243157-407a-431b-9897-fdaef26e69c0', '9950db3c-d109-4c5f-a4a8-ae35a3e81520', 1),
  ('a1243157-407a-431b-9897-fdaef26e69c0', '691c7016-cdcd-43c8-ad02-bdd39a27a17f', 2),
  ('a1243157-407a-431b-9897-fdaef26e69c0', '552e4f57-bb79-4b8d-ad91-d779f6121e99', 3);

-- Update the test result's total_questions count
UPDATE test_results 
SET total_questions = 3
WHERE test_id = 'a1243157-407a-431b-9897-fdaef26e69c0'
AND student_id = '09f28e6f-9b10-473e-86bb-2e8f5473774e'; 