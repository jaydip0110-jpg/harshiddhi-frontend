import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../redux/slices/authSlice";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(true);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validatePassword = (pwd) => {
    // Format: Name@123 — Uppercase, lowercase, number, special char
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const hasLength = pwd.length >= 6;
    return hasUpper && hasLower && hasNumber && hasSpecial && hasLength;
  };

  const validateEmail = (email) => {
    // Format: name123@gmail.com
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name) return toast.error("Name જરૂરી છે");

    if (!validateEmail(form.email)) {
      return toast.error("Valid email નાખો — name123@gmail.com format");
    }

    if (!validatePassword(form.password)) {
      return toast.error(
        "Password format: ઓછામાં ઓછો 1 uppercase, 1 lowercase, 1 number, 1 special character (@#$) — ઉદા: Name@123",
      );
    }

    if (form.password !== form.confirm) {
      return toast.error("Passwords match નથી");
    }

    if (!agreed) return toast.error("Please agree to Terms");

    dispatch(
      register({
        name: form.name,
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: form.phone,
      }),
    );
  };
  return (
    <div
      className="min-h-[90vh] flex items-center justify-center px-4 py-8 page-enter"
      style={{
        background: "linear-gradient(135deg, #fff8f0 0%, #fce4ec 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
            Create Account
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Join Harshiddhi Saari & Dresses 🌸
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <FiUser
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name *"
                className="input-field pl-11 py-3.5 rounded-2xl"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <FiMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address *"
                className="input-field pl-11 py-3.5 rounded-2xl"
                required
              />
            </div>

            {/* Phone */}
            <div
              className="flex border border-gray-300 rounded-2xl overflow-hidden
                           focus-within:ring-2 focus-within:ring-primary"
            >
              <div className="flex items-center px-4 bg-gray-50 border-r border-gray-300">
                <FiPhone size={14} className="text-gray-500 mr-1" />
                <span className="text-gray-600 font-semibold text-sm">+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                placeholder="Mobile Number (optional)"
                className="flex-1 px-4 py-3.5 text-sm outline-none"
                maxLength={10}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password * (min 6 characters)"
                className="input-field pl-11 pr-12 py-3.5 rounded-2xl"
                required
              />
              {/* Password hint */}
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Format: Name@123 (Uppercase + lowercase + number + @#$)
              </p>
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <FiLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Confirm Password *"
                className="input-field pl-11 py-3.5 rounded-2xl"
                required
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-primary mt-0.5 shrink-0"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                By continuing, I agree to the{" "}
                <span className="text-primary font-semibold">Terms of Use</span>{" "}
                &amp;{" "}
                <span className="text-primary font-semibold">
                  Privacy Policy
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                         text-sm tracking-widest uppercase hover:bg-primary-dark
                         transition-all shadow-lg shadow-primary/30"
            >
              {loading ? "Creating..." : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            onClick={() =>
              toast("Google signup coming soon! 🌸", { icon: "🔜" })
            }
            className="w-full flex items-center justify-center gap-3 py-3.5
                       border-2 border-gray-200 rounded-2xl hover:border-primary
                       hover:bg-rose/30 transition-all font-semibold text-sm text-gray-700"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
