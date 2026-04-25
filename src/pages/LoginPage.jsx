import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { FiPhone, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useSelector((s) => s.auth);

  const [loginType, setLoginType] = useState("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [step, setStep] = useState(1);

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user]);

  // Step 1 — Continue button
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (loginType === "phone") {
      if (phone.length !== 10) {
        return toast.error("Valid 10-digit phone number નાખો");
      }
    } else {
      if (!validateEmail(email)) {
        return toast.error("Valid email નાખો — name123@gmail.com format");
      }
    }

    if (!agreed) return toast.error("Please agree to Terms of Use");
    setStep(2);
  };

  // Step 2 — Login button
  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) return toast.error("Password નાખો");

    // Email format — user123@gmail.com જેવો format
    let loginEmail = email;

    if (loginType === "phone") {
      // Phone number થી login — backend માં phone field check કરે
      loginEmail = `${phone}@harshiddhi.com`;
    }

    dispatch(login({ email: loginEmail, password }));
  };

  return (
    <div
      className="min-h-[90vh] flex items-center justify-center px-4 py-8 page-enter"
      style={{
        background: "linear-gradient(135deg, #fff8f0 0%, #fce4ec 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Promo Banner */}
        <div
          className="bg-gradient-to-r from-primary to-pink-400 rounded-2xl p-4 mb-6
                        text-white relative overflow-hidden"
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
            Special Offer
          </p>
          <p className="font-display text-2xl font-bold">GET 20% OFF</p>
          <p className="text-sm opacity-90 mt-1">On your first order!</p>
          <div className="mt-3 inline-flex bg-white/20 rounded-lg px-3 py-1.5">
            <span className="text-xs font-bold tracking-widest">
              CODE: HARSHI20
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          {/* Tab — Email / Phone */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
            <button
              onClick={() => {
                setLoginType("email");
                setStep(1);
                setPhone("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5
                          rounded-xl text-sm font-semibold transition-all
                ${
                  loginType === "email"
                    ? "bg-white shadow text-primary"
                    : "text-gray-500"
                }`}
            >
              <FiMail size={15} /> Email
            </button>
            <button
              onClick={() => {
                setLoginType("phone");
                setStep(1);
                setEmail("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5
                          rounded-xl text-sm font-semibold transition-all
                ${
                  loginType === "phone"
                    ? "bg-white shadow text-primary"
                    : "text-gray-500"
                }`}
            >
              <FiPhone size={15} /> Phone
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
            Login <span className="text-gray-400 font-normal text-lg">or</span>{" "}
            Signup
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Welcome to Harshiddhi Saari & Dresses 🌸
          </p>

          {/* ── Step 1 — Enter Email or Phone ── */}
          {step === 1 && (
            <form onSubmit={handleContinue} className="space-y-4">
              {loginType === "email" ? (
                <div className="relative">
                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user123@gmail.com"
                    className="input-field pl-11 py-3.5 rounded-2xl"
                    required
                  />
                </div>
              ) : (
                <div
                  className="flex border border-gray-300 rounded-2xl overflow-hidden
                               focus-within:ring-2 focus-within:ring-primary"
                >
                  <div className="flex items-center px-4 bg-gray-50 border-r border-gray-300">
                    <span className="text-gray-600 font-semibold text-sm">
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 py-3.5 text-sm outline-none"
                    maxLength={10}
                    required
                  />
                </div>
              )}

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
                  <span className="text-primary font-semibold">
                    Terms of Use
                  </span>{" "}
                  &amp;{" "}
                  <span className="text-primary font-semibold">
                    Privacy Policy
                  </span>{" "}
                  and I am above 18 years old.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                           text-sm tracking-widest uppercase hover:bg-primary-dark
                           transition-all shadow-lg shadow-primary/30"
              >
                CONTINUE
              </button>
            </form>
          )}

          {/* ── Step 2 — Enter Password ── */}
          {step === 2 && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Show entered value */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">
                  {loginType === "phone" ? `+91 ${phone}` : email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setPassword("");
                  }}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Password */}
              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pl-11 pr-12 py-3.5 rounded-2xl"
                  required
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Password format: Name@123
                </p>
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                           text-sm tracking-widest uppercase hover:bg-primary-dark
                           transition-all shadow-lg shadow-primary/30"
              >
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            onClick={() =>
              toast("Google login coming soon! 🌸", { icon: "🔜" })
            }
            className="w-full flex items-center justify-center gap-3 py-3.5
                       border-2 border-gray-200 rounded-2xl hover:border-primary
                       hover:bg-rose/30 transition-all font-semibold text-sm text-gray-700"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            New here?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
            <p className="font-semibold mb-1">Demo Login:</p>
            <p>Email: admin@harshiddhi.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
