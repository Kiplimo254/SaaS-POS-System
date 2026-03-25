import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Store, LogIn, ShieldCheck, ShoppingBag } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("token/", {
        username,
        password,
      });
      await login(response.data.access, response.data.refresh);
      toast.success("Welcome back!", {
        description: "Successfully logged into the POS system.",
      });
      navigate("/");
    } catch (error: any) {
      toast.error("Login Failed", {
        description: error.response?.data?.detail || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-white bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              SmartPOS Pro
            </CardTitle>
            <CardDescription className="text-zinc-400 text-sm font-medium uppercase tracking-widest">
              Business Intelligence Suite
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300 font-medium ml-1">Username</Label>
              <div className="relative group">
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 transition-all duration-300 pl-4 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 font-medium ml-1">Password</Label>
                <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 transition-all duration-300 h-11"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-8 px-8 pb-8">
            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Terminal</span>
                </div>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-white/5 rounded-lg p-2 justify-center border border-white/5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>SSL SECURED</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-white/5 rounded-lg p-2 justify-center border border-white/5">
                <ShoppingBag className="w-3 h-3 text-blue-500" />
                <span>PCI COMPLIANT</span>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      {/* Bottom info section */}
      <div className="absolute bottom-6 w-full text-center text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em] z-10">
        © 2024 SmartPOS Systems · v2.4.0
      </div>
    </div>
  );
};

export default LoginPage;
