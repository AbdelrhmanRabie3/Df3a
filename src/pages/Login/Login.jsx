import { GrGithub, GrGoogle } from "react-icons/gr";
import AuthHeader from "../../components/Auth/AuthHeader";
import { Link, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "../../utils/Schema";
import toast from "react-hot-toast";
import { useContext, useState } from "react";
import { signin } from "../../services/authService";
import { AuthContext } from "../../contexts/AuthContextProvider";
import Cookies from "js-cookie";
function Login() {
  const navigate = useNavigate();
  const [KeptSignIn, setKeptSignIn] = useState(false);

  const { user, setUser, setToken } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });
  const onSubmit = async (data) => {
    try {
      const response = await signin(data);
      if (KeptSignIn) {
        Cookies.set("user", JSON.stringify(response.user), {
          expires: 30,
        });
        Cookies.set("token", response.token, {
          expires: 30,
        });
      } else {
        Cookies.set("user", JSON.stringify(response.user));
        Cookies.set("token", response.token);
      }

      setUser(response.user);
      setToken(response.token);
      toast.success("Registration successful!");
      if (response.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      setError("root", {
        message:
          error.response?.data?.message ||
          "An error occurred during registration.",
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };
  const handleGithubLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <>
      <div className="grid p-4 lg:p-8  mx-auto w-full h-dvh grid-cols-1 lg:grid-cols-2 lg:gap-16 bg-background">
        <AuthHeader />
        <div className="w-full  font-poppins max-w-md self-center">
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
            <h2 className="mb-2 text-center text-3xl font-bold text-primary">
              Welcome Back!
            </h2>
            <p className="mb-6 text-center text-sm text-secondary">
              Sign in to continue to Df3a.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-medium btn-secondary"
                onClick={handleGoogleLogin}
              >
                <GrGoogle size={24} />
                <span>Google</span>
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-medium btn-secondary"
                onClick={handleGithubLogin}
              >
                <GrGithub size={24} />
                <span>GitHub</span>
              </button>
            </div>
            <div className="my-6 flex items-center">
              <div className="flex-grow border-input"></div>
              <span className="mx-4 flex-shrink text-sm text-secondary ">
                Or with email
              </span>
              <div className="flex-grow border-input"></div>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w mx-auto space-y-5"
            >
              <p className="text-center text-red-500 text-sm">
                {errors.root?.message}
              </p>
              <div className="mb-5">
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="bg-input  border-input border text-primary text-sm rounded-md px-4 py-3  block w-full p-2.5  "
                  placeholder="Enter your Email"
                />
                <p className="mt-2 text-center text-red-500 text-sm">
                  {errors.email?.message}
                </p>
              </div>
              <div className="mb-5">
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  className="bg-input  border-input border text-primary text-sm rounded-md px-4 py-3  block w-full p-2.5  "
                  placeholder="Enter your password"
                />
                <p className="mt-2 text-center text-red-500 text-sm">
                  {errors.password?.message}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4  checked:bg-primary"
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    onChange={(e) => setKeptSignIn(e.target.checked)}
                  />
                  <label
                    className="ml-2 block checkbox_label text-primary"
                    htmlFor="remember-me"
                  >
                    Keep me signed in
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    className="font-medium link-primary link-primary:hover underline"
                    to={"/forgotPassword"}
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                className="btn-primary w-full rounded-md px-4 py-3 "
                type="submit"
              >
                {isSubmitting ? "Submitting...." : "Sign In"}
              </button>
            </form>
            <div className="flex items-center justify-center gap-2 mt-6">
              <p className="text-sm text-secondary">Don't have an account?</p>
              <Link className="link-primary underline" to={"/Signup"}>
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
