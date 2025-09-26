"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Settings, BarChart3, TrendingUp, Target, Lightbulb } from "lucide-react";

export default function WhatIfPage() {
  const scenarios = [
    {
      title: "Market Crash Simulation",
      description: "Simulate the impact of a 20% market crash on sentiment across different sectors",
      icon: TrendingUp,
      color: "bg-red-500",
      status: "Ready"
    },
    {
      title: "Product Launch Impact",
      description: "Model sentiment changes when a major tech company launches a new product",
      icon: Target,
      color: "bg-blue-500",
      status: "Ready"
    },
    {
      title: "Regulatory Change",
      description: "Analyze sentiment shifts following new government regulations in the tech sector",
      icon: Settings,
      color: "bg-green-500",
      status: "Ready"
    },
    {
      title: "Competitor Analysis",
      description: "Compare sentiment impact of different competitive strategies",
      icon: BarChart3,
      color: "bg-purple-500",
      status: "Ready"
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">What-If Analysis</h1>
          <p className="text-muted-foreground">Run scenario simulations to understand potential market sentiment impacts</p>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Quick Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Run a quick sentiment impact analysis with default parameters
                </p>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Custom Scenario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a custom scenario with your own parameters
                </p>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  View Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access previous simulation results and reports
                </p>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Scenario Templates */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Scenario Templates</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <Card key={scenario.title} className="group hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${scenario.color} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{scenario.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              {scenario.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {scenario.description}
                      </p>
                      <Button className="w-full group-hover:bg-primary/90">
                        <Play className="h-4 w-4 mr-2" />
                        Run Scenario
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Simulations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recent Simulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No simulations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Run your first scenario to see results here
                </p>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Start Your First Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </main>
  );
}