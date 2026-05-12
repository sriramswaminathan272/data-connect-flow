
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Database Connection Hub</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connect to Database</CardTitle>
            <CardDescription>
              Connect to your database to start querying data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect to PostgreSQL, MySQL, SQL Server and more.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/connect">
              <Button>Connect</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Trainer Dashboard</CardTitle>
            <CardDescription>
              SQL+NL knowledge-graph trainer dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Train and validate your SQL knowledge graph with natural language.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/trainer">
              <Button>Open Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Learn how to use the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Read the documentation to learn how to get the most out of our platform.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Read Docs</Button>
          </CardFooter>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame size={18} className="text-orange-500" />
              Grill Me — Brainstorm
            </CardTitle>
            <CardDescription>
              Super-powered brainstorming and auto research
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enter a topic, get grilled with deep questions, and build a structured research plan with gap analysis.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/brainstorm">
              <Button className="bg-orange-600 hover:bg-orange-700">Start Brainstorming</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
