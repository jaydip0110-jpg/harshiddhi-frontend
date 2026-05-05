import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, googleLogin } from "../redux/slices/authSlice";
import { FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import { auth, provider, signInWithPopup } from "../services/firebase";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useSelector((s) => s.auth);

  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [step, setStep] = useState(1);
  const [gLoading, setGLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user]);

  // Detect phone or email
  const isPhone = /^[0-9]+$/.test(identifier);

  // Step 1 — Continue
  const handleContinue = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return toast.error("Email અથવા Phone number નાખો");

    if (isPhone) {
      if (identifier.length !== 10)
        return toast.error("Valid 10-digit phone number નાખો");
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(identifier)) return toast.error("Valid email નાખો");
    }

    if (!agreed) return toast.error("Please agree to Terms of Use");
    setStep(2);
  };

  // Step 2 — Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) return toast.error("Password નાખો");
    const loginEmail = isPhone ? `${identifier}@harshiddhi.com` : identifier;
    dispatch(login({ email: loginEmail, password }));
  };

  // Google Login
  const handleGoogleLogin = async () => {
    if (!agreed) return toast.error("Please agree to Terms of Use");
    setGLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;
      await dispatch(
        googleLogin({
          name: gUser.displayName,
          email: gUser.email,
          googleId: gUser.uid,
          avatar: gUser.photoURL,
        }),
      ).unwrap();
      navigate(redirect, { replace: true });
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        toast.error("Google login cancelled");
      } else {
        toast.error("Google login failed");
      }
    } finally {
      setGLoading(false);
    }
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
        <div className="bg-gradient-to-r from-primary to-pink-400 rounded-2xl p-4 mb-6 text-white">
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
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
            Login <span className="text-gray-400 font-normal text-lg">or</span>{" "}
            Signup
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Welcome to Harshiddhi Saari & Dresses 🌸
          </p>

          {/* ── Step 1 — Single Input Box ── */}
          {step === 1 && (
            <form onSubmit={handleContinue} className="space-y-4">
              {/* Single Input — Email or Phone */}
              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.trim())}
                  placeholder="Email અથવા Mobile Number"
                  className="input-field pl-11 py-4 rounded-2xl text-sm"
                  required
                />
              </div>

              {/* Hint */}
              {identifier.length > 0 && (
                <p className="text-xs text-gray-400 -mt-2 ml-1">
                  {isPhone
                    ? `📱 Phone: +91 ${identifier}`
                    : `📧 Email: ${identifier}`}
                </p>
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

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* ── Google Login Button ── */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 py-4
                           border-2 border-gray-200 rounded-2xl hover:border-primary
                           hover:bg-rose/30 transition-all font-semibold text-sm
                           text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {gLoading ? (
                  <>
                    <div
                      className="w-5 h-5 border-2 border-primary border-t-transparent
                                    rounded-full animate-spin"
                    />
                    Signing in with Google...
                  </>
                ) : (
                  <>
                    <FcGoogle size={22} />
                    Continue with Google
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Step 2 — Password ── */}
          {step === 2 && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Show entered identifier */}
              <div
                className="flex items-center justify-between
                              bg-gray-50 rounded-2xl px-4 py-3"
              >
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {isPhone ? "📱 Mobile" : "📧 Email"}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {isPhone ? `+91 ${identifier}` : identifier}
                  </p>
                </div>
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
              <div>
                <div className="relative">
                  <FiLock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password નાખો"
                    className="input-field pl-11 pr-12 py-4 rounded-2xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">
                  Format: Name@123 (Uppercase + number + special char)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                           text-sm tracking-widest uppercase hover:bg-primary-dark
                           transition-all shadow-lg shadow-primary/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent
                                    rounded-full animate-spin"
                    />
                    Logging in...
                  </span>
                ) : (
                  "LOGIN"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google on Step 2 also */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5
                           border-2 border-gray-200 rounded-2xl hover:border-primary
                           hover:bg-rose/30 transition-all font-semibold text-sm
                           text-gray-700 disabled:opacity-60"
              >
                {gLoading ? (
                  <div
                    className="w-5 h-5 border-2 border-primary border-t-transparent
                                  rounded-full animate-spin"
                  />
                ) : (
                  <FcGoogle size={20} />
                )}
                Continue with Google
              </button>
            </form>
          )}

          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            New here?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
