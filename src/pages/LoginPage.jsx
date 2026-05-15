import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  googleLogin,
  sendOTP,
  verifyOTP,
} from "../redux/slices/authSlice";
import { FiUser, FiArrowLeft, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import {
  auth,
  provider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../services/firebase";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useSelector((s) => s.auth);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [gLoading, setGLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [loginMode, setLoginMode] = useState("password"); // 'password' | 'otp'
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmResult, setConfirmResult] = useState(null);
  const [devOtp, setDevOtp] = useState("");

  const recaptchaWidget = useRef(null);
  const redirect = searchParams.get("redirect") || "/";

  const isPhone = /^[0-9]{10}$/.test(identifier.trim());
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const isValid = isPhone || isEmail;

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Setup Recaptcha
  const setupRecaptcha = () => {
    if (!recaptchaWidget.current) {
      recaptchaWidget.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible", callback: () => {} },
      );
    }
    return recaptchaWidget.current;
  };

  // Step 1 — Continue
  const handleContinue = (e) => {
    e.preventDefault();
    if (!isValid) return toast.error("Valid email અથવા 10-digit phone નાખો");
    if (!agreed) return toast.error("Please agree to Terms of Use");
    setStep(2);
    setLoginMode("password");
  };

  // Password Login
  const handlePasswordLogin = (e) => {
    e.preventDefault();
    if (!password) return toast.error("Password નાખો");
    const loginEmail = isPhone
      ? `${identifier.trim()}@harshiddhi.com`
      : identifier.trim();
    dispatch(login({ email: loginEmail, password }));
  };

  // Send OTP
  const handleSendOTP = async () => {
    setLoginMode("otp");
    setOtp("");
    setDevOtp("");

    if (isPhone) {
      setSmsLoading(true);
      try {
        const recaptcha = setupRecaptcha();
        const result = await signInWithPhoneNumber(
          auth,
          `+91${identifier.trim()}`,
          recaptcha,
        );
        setConfirmResult(result);
        setResendTimer(30);
        toast.success(`OTP sent to +91 ${identifier} 📱`);
      } catch (err) {
        console.error("Phone OTP error:", err);
        if (err.code === "auth/too-many-requests") {
          toast.error("Too many attempts. Try later.");
        } else {
          toast.error("SMS send failed. Try again.");
        }
        if (recaptchaWidget.current) {
          recaptchaWidget.current.clear();
          recaptchaWidget.current = null;
        }
        setLoginMode("password");
      } finally {
        setSmsLoading(false);
      }
    } else {
      try {
        const result = await dispatch(
          sendOTP({ identifier: identifier.trim() }),
        ).unwrap();
        setResendTimer(30);
        if (result.devOtp) {
          setDevOtp(result.devOtp);
          toast.success(`Dev OTP: ${result.devOtp}`, { duration: 10000 });
        }
      } catch (_) {
        setLoginMode("password");
      }
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("6-digit OTP નાખો");

    if (isPhone && confirmResult) {
      setSmsLoading(true);
      try {
        const result = await confirmResult.confirm(otp);
        const fbUser = result.user;
        await dispatch(
          googleLogin({
            name: fbUser.displayName || `User${identifier.slice(-4)}`,
            email: `${identifier.trim()}@harshiddhi.com`,
            googleId: fbUser.uid,
            avatar: fbUser.photoURL || "",
          }),
        ).unwrap();
        navigate(redirect, { replace: true });
      } catch (err) {
        if (err.code === "auth/invalid-verification-code") {
          toast.error("Invalid OTP");
        } else if (err.code === "auth/code-expired") {
          toast.error("OTP expired. Resend karo.");
        } else {
          toast.error("Verification failed");
        }
      } finally {
        setSmsLoading(false);
      }
    } else {
      try {
        await dispatch(
          verifyOTP({
            identifier: identifier.trim(),
            otp,
          }),
        ).unwrap();
        navigate(redirect, { replace: true });
      } catch (_) {}
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setOtp("");
    setDevOtp("");
    if (isPhone && recaptchaWidget.current) {
      recaptchaWidget.current.clear();
      recaptchaWidget.current = null;
    }
    await handleSendOTP();
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
      {/* Invisible Recaptcha */}
      <div id="recaptcha-container" />

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

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleContinue} className="space-y-4">
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

              {identifier.length > 0 && (
                <p
                  className={`text-xs ml-1 ${isValid ? "text-green-600" : "text-amber-500"}`}
                >
                  {isPhone && `📱 +91 ${identifier}`}
                  {isEmail && `📧 ${identifier}`}
                  {!isValid && "⚠️ Valid email અથવા 10-digit phone નાખો"}
                </p>
              )}

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
                  </span>
                </span>
              </label>

              <button
                type="submit"
                disabled={!isValid}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                           text-sm tracking-widest uppercase hover:bg-primary-dark
                           transition-all shadow-lg shadow-primary/30
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONTINUE
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

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
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FcGoogle size={22} />
                )}
                Continue with Google
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Back + Identifier */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setPassword("");
                      setConfirmResult(null);
                      setLoginMode("password");
                    }}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiArrowLeft size={18} />
                  </button>
                  <div>
                    <p className="text-xs text-gray-400">
                      {isPhone ? "📱 Mobile" : "📧 Email"}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {isPhone ? `+91 ${identifier}` : identifier}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStep(1);
                    setLoginMode("password");
                  }}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              {/* ── Mode Toggle: Password / OTP ── */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setLoginMode("password")}
                  className={`flex-1 flex items-center justify-center gap-2
                              py-3 rounded-xl text-sm font-semibold transition-all
                    ${
                      loginMode === "password"
                        ? "bg-white shadow-md text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  🔑 Password
                </button>
                <button
                  onClick={handleSendOTP}
                  disabled={smsLoading || loading}
                  className={`flex-1 flex items-center justify-center gap-2
                              py-3 rounded-xl text-sm font-semibold transition-all
                              disabled:opacity-60
                    ${
                      loginMode === "otp"
                        ? "bg-white shadow-md text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {smsLoading ? (
                    <div
                      className="w-4 h-4 border-2 border-primary border-t-transparent
                                    rounded-full animate-spin"
                    />
                  ) : (
                    "📨"
                  )}
                  OTP
                </button>
              </div>

              {/* ── Password Mode ── */}
              {loginMode === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                      Format: Name@123
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
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
                        Logging in...
                      </span>
                    ) : (
                      "🔑 LOGIN WITH PASSWORD"
                    )}
                  </button>
                </form>
              )}

              {/* ── OTP Mode ── */}
              {loginMode === "otp" && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  {/* OTP Sent Info */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                    <p className="text-2xl mb-1">{isPhone ? "📱" : "📧"}</p>
                    <p className="text-sm font-semibold text-green-700">
                      OTP Sent!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {isPhone
                        ? `Check SMS on +91 ${identifier}`
                        : `Check email: ${identifier}`}
                    </p>
                  </div>

                  {/* Dev OTP */}
                  {devOtp && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-700 font-semibold">
                        🔧 Dev OTP:{" "}
                        <span className="text-xl font-bold tracking-widest">
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
                    disabled={loading || smsLoading || otp.length !== 6}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold
                               text-sm uppercase hover:bg-primary-dark transition-all
                               shadow-lg shadow-primary/30 disabled:opacity-60"
                  >
                    {loading || smsLoading ? (
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
                        Resend in{" "}
                        <span className="font-bold text-primary">
                          {resendTimer}s
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={smsLoading || loading}
                        className="text-sm text-primary font-semibold hover:underline
                                   disabled:opacity-60"
                      >
                        🔄 Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Google */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

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
            </div>
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
