import { Link } from "react-router";
import AuthHeader from "../../components/Auth/AuthHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../../utils/Schema";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { useLocation, useParams } from "react-router";
import Cookies from "js-cookie";
function ResetPassword() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onTouched",
    resolver: zodResolver(resetPasswordSchema),
  });
  const { resetPassword } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const { token: tokenFromPath } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const tokenFromQuery = searchParams.get("token");
  const token = tokenFromPath || tokenFromQuery;

  const onSubmit = async (data) => {
    setMessage("");
    setError("");
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    try {
      await resetPassword({ token, newPassword: data.password });
      setMessage(
        "Password reset successfully. You can now log in with your new password."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
  };

  return (
    <>
      <div className="grid p-4 lg:p-8 mx-auto w-full h-dvh grid-cols-1 lg:grid-cols-2 lg:gap-16 bg-background">
        <AuthHeader />
        <div className="w-full font-poppins max-w-md self-center">
          <div className="mb-6 text-center lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-3xl font-bold text-primary"
            >
              <svg
                className="h-8 w-8 text-brand"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                  fill="currentColor"
                ></path>
              </svg>
              <span>Df3a</span>
            </Link>
          </div>
          <div className="rounded-2xl bg-surface p-8 shadow-xl">
            <h2 className="mb-2 text-center text-2xl font-bold text-primary">
              Set a New Password
            </h2>
            <p className="mb-6 text-center text-base text-secondary">
              Create a new, strong password for your account
            </p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w mx-auto space-y-5"
            >
              <div className="mb-5">
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  className="bg-input border-input border text-primary text-sm rounded-md px-4 py-3 block w-full p-2.5"
                  placeholder="Enter new password"
                />
                <p className="mt-2 text-center text-red-500 text-sm">
                  {errors.password?.message}
                </p>
              </div>
              <div className="mb-5">
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  className="bg-input border-input border text-primary text-sm rounded-md px-4 py-3 block w-full p-2.5"
                  placeholder="Confirm new password"
                />
                <p className="mt-2 text-center text-red-500 text-sm">
                  {errors.confirmPassword?.message}
                </p>
              </div>
              {message && (
                <p className="mt-2 text-center text-green-600 text-sm">
                  {message}
                </p>
              )}
              {error && (
                <p className="mt-2 text-center text-red-500 text-sm">{error}</p>
              )}
              <button
                className="btn-primary w-full rounded-md px-4 py-3"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            <div className="footer mt-6 text-center">
              <Link className="link-primary underline text-sm" to="/login">
                ← Back to Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
