import { Button } from "antd";
import { useNavigate } from "react-router-dom";

import { AdminBrandMark } from "@components/admin/AdminBrandMark";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="surface-card max-w-md p-10 text-center">
        <div className="flex justify-center">
          <AdminBrandMark />
        </div>
        <div className="mt-8 text-[72px] font-semibold leading-none tracking-tighter2 text-white">
          404
        </div>
        <div className="mt-2 inline-block h-px w-10 bg-teal-500" />
        <h1 className="mt-4 text-[18px] font-semibold text-white">
          That route doesn't exist
        </h1>
        <p className="muted mt-2 text-[13px]">
          The page you're looking for has been moved or no longer exists.
        </p>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/admin")}
          className="mt-8"
        >
          Return to admin console
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
