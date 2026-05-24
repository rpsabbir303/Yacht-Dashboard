import { ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { SuccessState } from "@auth/components/SuccessState";
import { useAuthFlow } from "@auth/hooks/useAuthFlow";

const ResetSuccessPage = () => {
  const navigate = useNavigate();
  const { reset } = useAuthFlow();

  // Clear any leftover recovery state on mount — by the time the user lands
  // here the reset token has already been consumed by the API.
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <SuccessState
      title="Password reset complete"
      description="Your password has been updated. Use your new password the next time you sign in to the admin console."
      action={
        <Button
          type="primary"
          size="large"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          onClick={() => navigate("/auth/sign-in", { replace: true })}
        >
          Back to sign in
        </Button>
      }
    />
  );
};

export default ResetSuccessPage;
