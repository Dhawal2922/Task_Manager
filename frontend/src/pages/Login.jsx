import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const { token, user } = res.data.data;
      setAuth(user, token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-side">
        <div className="auth-card animate-slide">
          <div className="auth-logo">
            <LayoutGrid size={40} color="var(--clr-primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--clr-text)', marginLeft: 12, letterSpacing: '-0.04em' }}>TeamTask</span>
          </div>
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">Use your workspace credentials to access your projects and collaborate with your team.</p>

          <form onSubmit={handleSubmit(onSubmit)} id="form-login">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" className="form-control" placeholder="you@company.com" {...register("email")} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="form-label" style={{ marginBottom: 0 }} htmlFor="login-password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-primary)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <input id="login-password" type="password" className="form-control" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button type="submit" id="btn-login" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>

      <div className="auth-visual">
        <img 
          src="/auth-visual.png" 
          alt="TeamTask Dashboard" 
          className="auth-screenshot"
        />
      </div>
    </div>
  );
}
