"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Trash2,
  MessageSquare,
  Brain,
  BarChart3
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: {
    scenario: {
      type: string;
      parameters: any;
      description: string;
    };
    prediction: {
      sentiment: number;
      confidence: number;
      magnitude: number;
      direction: string;
      explanation: string;
    };
  };
}

export default function WhatIfPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your What-If Analysis AI assistant. I can help you simulate various market scenarios and predict their sentiment impact. Try asking me things like:\n\n• \"What if Tesla stock crashes by 30%?\"\n• \"What if Apple launches a new iPhone?\"\n• \"What if the Fed raises interest rates by 2%?\"\n• \"What if there's a new regulation on AI companies?\"\n\nWhat scenario would you like to explore?",
      timestamp: new Date()
    }]);
  }, []);

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (sentiment < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return "text-green-600 bg-green-50 border-green-200";
    if (sentiment < -0.1) return "text-red-600 bg-red-50 border-red-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const formatSentiment = (sentiment: number) => {
    return (sentiment * 100).toFixed(1) + "%";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/whatif/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: input.trim(),
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I've analyzed your scenario: **${data.scenario.description}**

**Sentiment Prediction:**
${getSentimentIcon(data.prediction.sentiment)} **${formatSentiment(data.prediction.sentiment)}** (${data.prediction.direction})
Confidence: ${(data.prediction.confidence * 100).toFixed(0)}%

**Explanation:** ${data.prediction.explanation}

**Scenario Details:**
- Type: ${data.scenario.type.replace('_', ' ').toUpperCase()}
- Parameters: ${JSON.stringify(data.scenario.parameters, null, 2)}

Would you like to explore another scenario or ask for more details about this analysis?`,
          timestamp: new Date(),
          analysis: data
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I encountered an error analyzing your scenario: ${data.error}

Please try rephrasing your question or ask about a different scenario.`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting to the analysis service. Please check your connection and try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    try {
      await fetch('/api/v1/whatif/conversation/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
    
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your What-If Analysis AI assistant. I can help you simulate various market scenarios and predict their sentiment impact. Try asking me things like:\n\n• \"What if Tesla stock crashes by 30%?\"\n• \"What if Apple launches a new iPhone?\"\n• \"What if the Fed raises interest rates by 2%?\"\n• \"What if there's a new regulation on AI companies?\"\n\nWhat scenario would you like to explore?",
      timestamp: new Date()
    }]);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8" />
              What-If Analysis Chat
            </h1>
            <p className="text-muted-foreground">AI-powered market scenario simulation and sentiment prediction</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearConversation}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with AI Analyst
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      
                      {message.analysis && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="text-xs font-medium">Analysis Results</span>
                          </div>
                          
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${getSentimentColor(message.analysis.prediction.sentiment)}`}>
                            {getSentimentIcon(message.analysis.prediction.sentiment)}
                            {formatSentiment(message.analysis.prediction.sentiment)}
                            <span className="opacity-75">
                              ({message.analysis.prediction.confidence * 100}% confidence)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Analyzing scenario...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any market scenario... (e.g., 'What if Tesla stock crashes by 30%?')"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Quick Examples */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Quick Examples:</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "What if Tesla stock crashes by 30%?",
            "What if Apple launches a new iPhone?",
            "What if the Fed raises rates by 2%?",
            "What if there's new AI regulation?",
            "What if Amazon beats earnings by 15%?",
            "What if there's a major data breach?"
          ].map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInput(example)}
              disabled={isLoading}
              className="text-xs"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}