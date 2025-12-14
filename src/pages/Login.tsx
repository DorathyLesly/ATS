import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Briefcase, User, Lock, ArrowRight, Sparkles } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(username, password);
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Try admin/123",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Briefcase className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">TalentFlow</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Hire smarter,<br />
            <span className="text-white/80">faster.</span>
          </h1>
          
          <p className="text-xl text-white/70 mb-12 max-w-md leading-relaxed">
            Streamline your recruitment process with AI-powered insights and beautiful candidate management.
          </p>

          <div className="space-y-4">
            {[
              "AI-powered resume analysis",
              "Pipeline automation",
              "Team collaboration"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TalentFlow</span>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 h-12 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              Demo credentials: <span className="font-semibold text-foreground">admin</span> / <span className="font-semibold text-foreground">123</span>
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <button className="text-primary font-medium hover:underline">
              Contact your admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
