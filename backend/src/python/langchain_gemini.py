#!/usr/bin/env python3
"""
Langchain Gemini NLP Processing Script for What-If Analysis
Two-stage approach: Classification + Processing
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
            print("GEMINI_API_KEY not set, using fallback logic", file=sys.stderr)
            return self.fallback_response(prompt)
        
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

    def fallback_response(self, prompt: str) -> str:
        """Fallback response when Gemini API is not available"""
        # Simple keyword-based classification
        prompt_lower = prompt.lower()
        
        # Check for scenario keywords
        scenario_keywords = ['what if', 'crash', 'launch', 'earnings', 'merger', 'regulation', 'competitor', 'economic']
        if any(keyword in prompt_lower for keyword in scenario_keywords):
            # Return scenario classification
            return json.dumps({
                "input_type": "scenario",
                "confidence": 0.7,
                "reasoning": "Fallback classification based on keywords"
            })
        else:
            # Return conversational classification
            return json.dumps({
                "input_type": "other", 
                "confidence": 0.6,
                "reasoning": "Fallback classification - appears to be conversational"
            })

    def classify_input_type(self, user_input: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Stage 1: Classify if input is a scenario request or other conversation"""
        
        # Build context from conversation history
        context = ""
        if conversation_history:
            context = "Previous conversation:\n"
            for msg in conversation_history[-5:]:  # Last 5 messages for context
                context += f"{msg['role']}: {msg['content']}\n"
        
        prompt = f"""You are a financial analyst AI assistant. Your job is to classify user input into one of two categories:

1. "scenario" - User wants to analyze a specific market scenario (what-if analysis)
2. "other" - User is asking questions, requesting explanations, or having general conversation

Available scenario types: {list(self.scenario_types.keys())}

{context}

User Input: "{user_input}"

Classify this input and return ONLY a JSON object:
{{
    "input_type": "scenario" or "other",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation of classification"
}}

Examples:
- "What if Tesla stock crashes by 30%?" → {{"input_type": "scenario", "confidence": 0.9, "reasoning": "Clear what-if scenario request"}}
- "Why did the sentiment change?" → {{"input_type": "other", "confidence": 0.8, "reasoning": "Question about previous analysis"}}
- "Can you explain the results?" → {{"input_type": "other", "confidence": 0.9, "reasoning": "Request for explanation"}}
- "What's the weather like?" → {{"input_type": "other", "confidence": 0.9, "reasoning": "Unrelated to financial analysis"}}"""

        try:
            response = self.call_gemini_api(prompt)
            
            # Extract JSON from response
            json_match = None
            if '{' in response and '}' in response:
                start = response.find('{')
                end = response.rfind('}') + 1
                json_str = response[start:end]
                try:
                    json_match = json.loads(json_str)
                except json.JSONDecodeError:
                    pass
            
            if json_match and json_match.get('input_type') in ['scenario', 'other']:
                return json_match
            else:
                # Fallback classification
                return {
                    "input_type": "other",
                    "confidence": 0.5,
                    "reasoning": "Unable to parse classification, defaulting to other"
                }
                
        except Exception as e:
            print(f"Error in classification: {str(e)}", file=sys.stderr)
            return {
                "input_type": "other",
                "confidence": 0.3,
                "reasoning": f"Classification error: {str(e)}"
            }

    def extract_scenario_info(self, user_input: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Stage 2a: Extract scenario information for what-if analysis"""
        
        # Try fallback extraction first if no API key
        if not self.api_key:
            return self.fallback_scenario_extraction(user_input)
        
        prompt = f"""You are an expert financial analyst AI that converts natural language into structured scenario data for market sentiment prediction.

User Input: "{user_input}"

Your task is to:
1. Identify the most appropriate scenario type from these options: {list(self.scenario_types.keys())}
2. Extract relevant parameters for that scenario type
3. Provide confidence score (0-1) for your analysis
4. Give a brief explanation

Available scenario types and their required parameters:
{json.dumps(self.scenario_types, indent=2)}

IMPORTANT RULES:
- Always extract numerical values when mentioned (percentages, amounts, etc.)
- For company names, use the most likely company if not specified
- For sectors, use standard industry classifications
- Be precise with parameter extraction

Return ONLY a valid JSON object with this exact structure:
{{
    "scenario_type": "string",
    "parameters": {{}},
    "confidence": 0.0-1.0,
    "explanation": "string"
}}

Examples:
- "What if Tesla stock crashes by 30%?" → {{"scenario_type": "market_crash", "parameters": {{"crash_percent": 30}}, "confidence": 0.9, "explanation": "Market crash scenario for Tesla stock"}}
- "What if Apple launches a new iPhone?" → {{"scenario_type": "product_launch", "parameters": {{"product_name": "iPhone", "category": "smartphone"}}, "confidence": 0.8, "explanation": "Product launch scenario for Apple iPhone"}}"""

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
            print(f"Error in scenario extraction: {str(e)}", file=sys.stderr)
            return self.fallback_scenario_extraction(user_input)

    def fallback_scenario_extraction(self, user_input: str) -> Dict[str, Any]:
        """Fallback scenario extraction using keyword matching"""
        user_lower = user_input.lower()
        
        # Extract numbers (percentages, amounts)
        import re
        numbers = re.findall(r'\d+(?:\.\d+)?', user_input)
        
        # Simple keyword-based scenario detection
        if 'crash' in user_lower or 'crash' in user_lower:
            crash_percent = int(numbers[0]) if numbers else 20
            return {
                "scenario_type": "market_crash",
                "parameters": {"crash_percent": crash_percent},
                "confidence": 0.7,
                "explanation": f"Fallback: Market crash scenario with {crash_percent}% decline"
            }
        elif 'launch' in user_lower or 'product' in user_lower:
            return {
                "scenario_type": "product_launch", 
                "parameters": {"product_name": "New Product", "category": "technology"},
                "confidence": 0.6,
                "explanation": "Fallback: Product launch scenario"
            }
        elif 'earnings' in user_lower and ('beat' in user_lower or 'exceed' in user_lower):
            beat_percent = int(numbers[0]) if numbers else 10
            return {
                "scenario_type": "earnings_beat",
                "parameters": {"company": "Company", "beat_percent": beat_percent},
                "confidence": 0.6,
                "explanation": f"Fallback: Earnings beat scenario by {beat_percent}%"
            }
        elif 'earnings' in user_lower and ('miss' in user_lower or 'disappoint' in user_lower):
            miss_percent = int(numbers[0]) if numbers else 10
            return {
                "scenario_type": "earnings_miss",
                "parameters": {"company": "Company", "miss_percent": miss_percent},
                "confidence": 0.6,
                "explanation": f"Fallback: Earnings miss scenario by {miss_percent}%"
            }
        else:
            return {
                "scenario_type": "market_crash",
                "parameters": {"crash_percent": 20},
                "confidence": 0.4,
                "explanation": "Fallback: Default market crash scenario"
            }

    def generate_conversational_response(self, user_input: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Stage 2b: Generate conversational response for non-scenario inputs"""
        
        # Build rich context from conversation history
        context = ""
        if conversation_history:
            context = "Previous conversation and analysis history:\n"
            for msg in conversation_history[-10:]:  # Last 10 messages for richer context
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')
                
                # Extract analysis data if present
                if 'analysis' in msg and msg['analysis']:
                    analysis = msg['analysis']
                    if 'scenario' in analysis and 'prediction' in analysis:
                        scenario = analysis['scenario']
                        prediction = analysis['prediction']
                        context += f"{role}: {content}\n"
                        context += f"  [Previous Analysis: {scenario.get('type', 'unknown')} - Sentiment: {prediction.get('sentiment', 0):.2f} - Confidence: {prediction.get('confidence', 0):.2f}]\n"
                    else:
                        context += f"{role}: {content}\n"
                else:
                    context += f"{role}: {content}\n"
        
        prompt = f"""You are an intelligent financial analyst AI assistant with access to previous what-if analysis results. You can:

1. Answer questions about previous analyses
2. Explain market concepts and scenarios
3. Provide insights based on historical predictions
4. Help users understand financial terminology
5. Suggest related scenarios to explore
6. Clarify analysis results and methodology

{context}

User Input: "{user_input}"

Respond as a helpful financial analyst. Be conversational, informative, and reference previous analyses when relevant. If the user asks about previous predictions, explain them clearly. If they want to explore new scenarios, guide them on how to phrase their questions.

Return ONLY a JSON object with this structure:
{{
    "response_type": "conversational",
    "message": "your helpful response here",
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
    "references_previous_analysis": true/false
}}

Keep your response conversational and helpful. Reference specific previous analyses when relevant."""

        try:
            response = self.call_gemini_api(prompt)
            
            # Extract JSON from response
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
                # Fallback response
                return {
                    "response_type": "conversational",
                    "message": "I'm here to help with your financial analysis questions. Could you please rephrase your question or ask about a specific scenario?",
                    "suggestions": [
                        "What if Tesla stock crashes by 30%?",
                        "What if Apple launches a new iPhone?",
                        "Can you explain the previous analysis?"
                    ],
                    "references_previous_analysis": False
                }
                
        except Exception as e:
            print(f"Error in conversational response: {str(e)}", file=sys.stderr)
            return {
                "response_type": "conversational",
                "message": f"I encountered an error processing your request: {str(e)}. Please try rephrasing your question.",
                "suggestions": [
                    "What if Tesla stock crashes by 30%?",
                    "What if Apple launches a new iPhone?"
                ],
                "references_previous_analysis": False
            }

    def process_input(self, user_input: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Main processing function with two-stage approach"""
        try:
            # Stage 1: Classify input type
            classification = self.classify_input_type(user_input, conversation_history)
            input_type = classification.get('input_type', 'other')
            
            print(f"Classification: {input_type} (confidence: {classification.get('confidence', 0):.2f})", file=sys.stderr)
            
            if input_type == 'scenario':
                # Stage 2a: Extract scenario information
                scenario_result = self.extract_scenario_info(user_input, conversation_history)
                
                # Validate scenario type
                if scenario_result.get('scenario_type') not in self.scenario_types:
                    scenario_result['scenario_type'] = 'unclear'
                    scenario_result['confidence'] = 0.3
                    scenario_result['explanation'] = 'Unrecognized scenario type'
                
                return {
                    "processing_type": "scenario",
                    "classification": classification,
                    "scenario_data": scenario_result
                }
            else:
                # Stage 2b: Generate conversational response
                conversational_result = self.generate_conversational_response(user_input, conversation_history)
                
                return {
                    "processing_type": "conversational",
                    "classification": classification,
                    "conversational_data": conversational_result
                }
            
        except Exception as e:
            print(f"Error in process_input: {str(e)}", file=sys.stderr)
            return {
                "processing_type": "error",
                "error": str(e),
                "fallback_response": {
                    "response_type": "conversational",
                    "message": f"I encountered an error processing your request. Please try rephrasing your question or ask about a specific scenario.",
                    "suggestions": [
                        "What if Tesla stock crashes by 30%?",
                        "What if Apple launches a new iPhone?"
                    ],
                    "references_previous_analysis": False
                }
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
        
        # Process the input with two-stage approach
        result = processor.process_input(user_input, conversation_history)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "processing_type": "error",
            "error": str(e),
            "fallback_response": {
                "response_type": "conversational",
                "message": f"Script error: {str(e)}. Please try again.",
                "suggestions": [
                    "What if Tesla stock crashes by 30%?",
                    "What if Apple launches a new iPhone?"
                ],
                "references_previous_analysis": False
            }
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()