#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print test results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ $2${NC}"
  else
    echo -e "${RED}✗ $2${NC}"
  fi
}

# Function to make a request and check the response
test_endpoint() {
  local url=$1
  local expected_status=$2
  local description=$3

  echo -e "${YELLOW}Testing: $description${NC}"
  echo -e "URL: $url"

  # Make the request
  response=$(curl -s -w "\n%{http_code}" "$url")
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  # Check status code
  if [ "$status_code" -eq "$expected_status" ]; then
    print_result 0 "Status code: $status_code (expected $expected_status)"
  else
    print_result 1 "Status code: $status_code (expected $expected_status)"
  fi

  # Print response body (truncated if too long)
  if [ ${#body} -gt 500 ]; then
    echo -e "Response (truncated): ${body:0:500}..."
  else
    echo -e "Response: $body"
  fi

  echo ""
}

# Start testing
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}= AI Tutor API Testing Script     =${NC}"
echo -e "${BLUE}====================================${NC}"

# Test health endpoints
print_header "Testing Health Endpoints"
test_endpoint "http://localhost:3000/api/health" 200 "Next.js Health Check"
test_endpoint "http://localhost:8000/api/health" 200 "PHP Health Check"
test_endpoint "http://localhost:8000/api/health?fallback=1" 200 "PHP Health Check with Fallback Mode"

# Test error responses
print_header "Testing Error Responses"
test_endpoint "http://localhost:8000/api/notes?lessonId=invalid-id&fallback=1" 404 "PHP Error Response - Not Found"
test_endpoint "http://localhost:8000/api/notes?fallback=1" 400 "PHP Error Response - Bad Request"
test_endpoint "http://localhost:3000/api/knowledge-test" 405 "Next.js Error Response - Method Not Allowed"

# Test database endpoints with fallback mode
print_header "Testing Database Endpoints with Fallback Mode"
test_endpoint "http://localhost:8000/api/notes?test=1" 200 "PHP Notes API Test Mode"
test_endpoint "http://localhost:8000/api/bookmarks?test=1" 200 "PHP Bookmarks API Test Mode"
test_endpoint "http://localhost:8000/api/user-progress?test=1" 200 "PHP User Progress API Test Mode"
test_endpoint "http://localhost:8000/api/knowledge-test?test=1" 200 "PHP Knowledge Test API Test Mode"

# Test fallback mode for database operations
print_header "Testing Fallback Mode for Database Operations"
test_endpoint "http://localhost:8000/api/notes?lessonId=lesson-1&fallback=1" 200 "PHP Notes API with Fallback Mode"
test_endpoint "http://localhost:8000/api/bookmarks?lessonId=lesson-1&fallback=1" 200 "PHP Bookmarks API with Fallback Mode"

echo -e "\n${BLUE}====================================${NC}"
echo -e "${BLUE}= Testing Complete                =${NC}"
echo -e "${BLUE}====================================${NC}"
