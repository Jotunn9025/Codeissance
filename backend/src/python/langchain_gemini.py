#!/usr/bin/env python3
"""
Langchain Gemini NLP Processing Script for What-If Analysis
Processes natural language input and converts it to structured scenario data
"""

import json
import sys
import os
import requests
from typing import Dict, List, Any, Optional

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class GeminiNLPProcessor:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        
        # Scenario type definitions
        self.scenario_types = {
            'market_crash': {
                'keywords': ['crash', 'market crash', 'stock crash', 'market downturn', 'bear market', 'recession'],
                'required_params': ['crash_percent'],
                'description': 'Market crash scenario'
            },
            'product_launch': {
                'keywords': ['product launch', 'new product', 'launch', 'release', 'unveil', 'introduce'],
                'required_params': ['product_name', 'category'],
                'description': 'Product launch scenario'
            },
            'earnings_beat': {
                'keywords': ['earnings beat', 'beat expectations', 'exceed earnings', 'surpass earnings', 'strong earnings'],
                'required_params': ['company', 'beat_percent'],
                'description': 'Earnings beat scenario'
            },
            'earnings_miss': {
                'keywords': ['earnings miss', 'miss expectations', 'disappoint earnings', 'weak earnings', 'poor earnings'],
                'required_params': ['company', 'miss_percent'],
                'description': 'Earnings miss scenario'
            },
            'merger_acquisition': {
                'keywords': ['merger', 'acquisition', 'buyout', 'takeover', 'acquire', 'merge'],
                'required_params': ['acquirer', 'target'],
                'description': 'Merger/acquisition scenario'
            },
            'regulatory_change': {
                'keywords': ['regulation', 'regulatory', 'policy change', 'new law', 'compliance', 'government'],
                'required_params': ['regulation', 'sector'],
                'description': 'Regulatory change scenario'
            },
            'competitor_announcement': {
                'keywords': ['competitor', 'rival', 'competition', 'announcement', 'competitor news'],
                'required_params': ['competitor', 'announcement_type'],
                'description': 'Competitor announcement scenario'
            },
            'economic_indicator': {
                'keywords': ['gdp', 'inflation', 'unemployment', 'interest rate', 'economic indicator', 'economic data'],
                'required_params': ['indicator', 'change_percent'],
                'description': 'Economic indicator change scenario'
            }
        }

    def call_gemini_api(self, prompt: str) -> str:
        """Call Gemini API with the given prompt"""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        headers = {
            'x-goog-api-key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2000,
            }
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=20000
            )
            response.raise_for_status()
            
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                raise ValueError("No valid response from Gemini API")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"Invalid API response format: {str(e)}")

    def extract_scenario_info(self, user_input: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Extract scenario information using Gemini API"""
        
        # Build context from conversation history
        context = ""
        if conversation_history:
            context = "Previous conversation:\n"
            for msg in conversation_history[-5:]:  # Last 5 messages for context
                context += f"{msg['role']}: {msg['content']}\n"
        
        prompt = f"""You are an expert financial analyst AI that converts natural language into structured scenario data for market sentiment prediction.

{context}

User Input: "{user_input}"

Your task is to:
1. Identify the most appropriate scenario type from these options: {list(self.scenario_types.keys())}

Available scenario types and their required parameters:
{json.dumps(self.scenario_types, indent=2)}

IMPORTANT RULES:
- If the user asks "why" or requests explanation, return scenario_type as "explanation_request" with explanation in parameters
- If the user asks for clarification or more details, return scenario_type as "clarification_request"
- If the input is unclear, return scenario_type as "unclear" with confidence 0.3
- Always extract numerical values when mentioned (percentages, amounts, etc.)
- For company names, use the most likely company if not specified
- For sectors, use standard industry classifications

Return ONLY a valid JSON object with this exact structure:
{{
    "scenario_type": "string",
    "parameters": {{}},
    "confidence": 0.0-1.0,
    "explanation": "string"
}}

Examples:
- "What if Tesla stock crashes by 30%?" → {{"scenario_type": "market_crash", "parameters": {{"crash_percent": 30}}, "confidence": 0.9, "explanation": "Market crash scenario for Tesla stock"}}
- "What if Apple launches a new iPhone?" → {{"scenario_type": "product_launch", "parameters": {{"product_name": "iPhone", "category": "smartphone"}}, "confidence": 0.8, "explanation": "Product launch scenario for Apple iPhone"}}
- "Why did the sentiment change?" → {{"scenario_type": "explanation_request", "parameters": {{"explanation": "User requesting explanation of previous analysis"}}, "confidence": 0.9, "explanation": "Explanation request"}}"""

        try:
            response = self.call_gemini_api(prompt)
            
            # Try to extract JSON from response
            json_match = None
            if '{' in response and '}' in response:
                start = response.find('{')
                end = response.rfind('}') + 1
                json_str = response[start:end]
                try:
                    json_match = json.loads(json_str)
                except json.JSONDecodeError:
                    pass
            
            if json_match:
                return json_match
            else:
                # Fallback: try to parse the entire response as JSON
                return json.loads(response)
                
        except Exception as e:
            print(f"Error in Gemini API call: {str(e)}", file=sys.stderr)
            # Return fallback response
            return {
                "scenario_type": "unclear",
                "parameters": {"error": str(e)},
                "confidence": 0.3,
                "explanation": f"Failed to process with AI: {str(e)}"
            }

    def process_input(self, user_input: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Main processing function"""
        try:
            # Extract scenario information using Gemini
            result = self.extract_scenario_info(user_input, conversation_history)
            
            # Validate and clean the result
            if not isinstance(result, dict):
                raise ValueError("Invalid result format")
            
            # Ensure required fields exist
            result.setdefault('scenario_type', 'unclear')
            result.setdefault('parameters', {})
            result.setdefault('confidence', 0.5)
            result.setdefault('explanation', 'Processed with AI analysis')
            
            # Validate scenario type
            if result['scenario_type'] not in self.scenario_types and result['scenario_type'] not in ['explanation_request', 'clarification_request', 'unclear']:
                result['scenario_type'] = 'unclear'
                result['confidence'] = 0.3
                result['explanation'] = 'Unrecognized scenario type'
            
            return result
            
        except Exception as e:
            print(f"Error in process_input: {str(e)}", file=sys.stderr)
            return {
                "scenario_type": "unclear",
                "parameters": {"error": str(e)},
                "confidence": 0.2,
                "explanation": f"Processing error: {str(e)}"
            }

def main():
    """Main function to process input from stdin"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        user_input = input_data.get('user_input', '')
        conversation_history = input_data.get('conversation_history', [])
        available_scenario_types = input_data.get('scenario_types', [])
        
        if not user_input:
            raise ValueError("No user input provided")
        
        # Initialize processor
        processor = GeminiNLPProcessor()
        
        # Process the input
        result = processor.process_input(user_input, conversation_history)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "scenario_type": "unclear",
            "parameters": {"error": str(e)},
            "confidence": 0.1,
            "explanation": f"Script error: {str(e)}"
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
