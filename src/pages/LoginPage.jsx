import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin, sendOTP, verifyOTP } from "../redux/slices/authSlice";
import { FiUser, FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import { auth, provider, signInWithPopup } from "../services/firebase";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useSelector((s) => s.auth);

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [gLoading, setGLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState("");
  const [step, setStep] = useState(1);

  const redirect = searchParams.get("redirect") || "/";

  const isPhone = /^[0-9]{10}$/.test(identifier);
  const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    identifier,
  );
  const isValid = isPhone || isEmail;

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user]);

  // Resend Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Step 1 — Send OTP
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!isValid) return toast.error("Valid email અથવા 10-digit phone નાખો");
    if (!agreed) return toast.error("Please agree to Terms of Use");

    try {
      const result = await dispatch(sendOTP({ identifier })).unwrap();
      setOtpSent(true);
      setStep(2);
      setResendTimer(30);
      // Dev mode OTP show
      if (result.devOtp) {
        setDevOtp(result.devOtp);
        toast.success(`Dev OTP: ${result.devOtp}`, { duration: 10000 });
      }
    } catch (_) {}
  };

  // Resend OTP
  const handleResend = async () => {
    setOtp("");
    setDevOtp("");
    try {
      const result = await dispatch(sendOTP({ identifier })).unwrap();
      setResendTimer(30);
      if (result.devOtp) {
        setDevOtp(result.devOtp);
        toast.success(`Dev OTP: ${result.devOtp}`, { duration: 10000 });
      }
    } catch (_) {}
  };

  // Step 2 — Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("6-digit OTP નાખો");
    try {
      await dispatch(verifyOTP({ identifier, otp })).unwrap();
      navigate(redirect, { replace: true });
    } catch (_) {}
  };

  // Google Login
  const handleGoogleLogin = async () => {
    if (!agreed) return toast.error("Please agree to Terms");
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
      if (err.code !== "auth/popup-closed-by-user") {
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

          {/* ── Step 1 — Enter Email or Phone ── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Input */}
              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.trim())}
                  placeholder="Email અથવા 10-digit Mobile Number"
                  className="input-field pl-11 py-4 rounded-2xl text-sm"
                  required
                />
              </div>

              {/* Hint */}
              {identifier.length > 0 && (
                <div
                  className={`text-xs ml-1 flex items-center gap-1
                  ${isValid ? "text-green-600" : "text-amber-500"}`}
                >
                  {isPhone && "📱 SMS OTP will be sent to +91 " + identifier}
                  {isEmail && "📧 Email OTP will be sent to " + identifier}
                  {!isValid && "⚠️ Valid email અથવા 10-digit phone નાખો"}
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

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                           text-sm tracking-widest uppercase hover:bg-primary-dark
                           transition-all shadow-lg shadow-primary/30
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent
                                    rounded-full animate-spin"
                    />
                    Sending OTP...
                  </span>
                ) : isPhone ? (
                  "📱 Send OTP via SMS"
                ) : isEmail ? (
                  "📧 Send OTP via Email"
                ) : (
                  "Send OTP"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 py-4
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
                  <FcGoogle size={22} />
                )}
                Continue with Google
              </button>
            </form>
          )}

          {/* ── Step 2 — Enter OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              {/* Back + Identifier */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setOtpSent(false);
                    }}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiArrowLeft size={18} />
                  </button>
                  <div>
                    <p className="text-xs text-gray-400">
                      {isPhone
                        ? "📱 OTP sent via SMS"
                        : "📧 OTP sent via Email"}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {isPhone ? `+91 ${identifier}` : identifier}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                  }}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              {/* OTP Sent Info */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                <p className="text-2xl mb-1">{isPhone ? "📱" : "📧"}</p>
                <p className="text-sm font-semibold text-green-700">
                  OTP Sent Successfully!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {isPhone
                    ? `Check SMS on +91 ${identifier}`
                    : `Check email inbox of ${identifier}`}
                </p>
              </div>

              {/* Dev OTP hint */}
              {devOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-semibold">
                    🔧 Dev Mode OTP:{" "}
                    <span className="text-lg font-bold tracking-widest">
                      {devOtp}
                    </span>
                  </p>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block text-center">
                  Enter 6-digit OTP
                </label>
                <input
                  type="tel"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="input-field py-5 text-center text-3xl font-bold
                             tracking-[0.8em] rounded-2xl"
                  required
                  autoFocus
                />
                {otp.length > 0 && otp.length < 6 && (
                  <p className="text-xs text-amber-500 text-center mt-1">
                    {6 - otp.length} digits remaining
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                           text-sm uppercase hover:bg-primary-dark transition-all
                           shadow-lg shadow-primary/30 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent
                                    rounded-full animate-spin"
                    />
                    Verifying...
                  </span>
                ) : (
                  "✅ VERIFY OTP & LOGIN"
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400">
                    Resend OTP in{" "}
                    <span className="font-bold text-primary text-sm">
                      {resendTimer}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-primary font-semibold hover:underline
                               disabled:opacity-60"
                  >
                    🔄 Resend OTP
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5
                           border-2 border-gray-200 rounded-2xl hover:border-primary
                           hover:bg-rose/30 transition-all font-semibold text-sm text-gray-700"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
            </form>
          )}

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
