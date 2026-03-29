import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="font-poppins font-bold text-5xl text-gray-900">404</h1>
      <p className="font-poppins text-gray-500">Page not found</p>
      <Button
        label="Go Home"
        icon={ArrowLeft}
        onClick={() => navigate("/")}
        iconPosition="left"
      />
    </div>
  );
};

export default NotFound;