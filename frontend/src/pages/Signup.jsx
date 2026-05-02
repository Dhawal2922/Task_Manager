import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["Admin", "Member"]),
});

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "Member" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", data);
      const { token, user } = res.data.data;
      setAuth(user, token);
      toast.success("Account created! Welcome aboard 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed.");
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join TeamTask to start collaborating with your workspace and managing projects with precision.</p>

          <form onSubmit={handleSubmit(onSubmit)} id="form-signup">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <input id="signup-name" type="text" className="form-control" placeholder="Jane Doe" {...register("name")} />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email Address</label>
                <input id="signup-email" type="email" className="form-control" placeholder="you@company.com" {...register("email")} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-role">Role</label>
                <select id="signup-role" className="form-control" {...register("role")}>
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && <p className="form-error">{errors.role.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" className="form-control" placeholder="Min. 8 characters" {...register("password")} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button type="submit" id="btn-signup" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
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
