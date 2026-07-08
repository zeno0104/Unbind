import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const OAuthCallback = ({ onLoginSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      onLoginSuccess(token);
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, onLoginSuccess, navigate]);

  return null;
};
