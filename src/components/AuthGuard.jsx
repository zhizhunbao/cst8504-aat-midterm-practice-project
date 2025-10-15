import React from "react";
import { useUser } from "../contexts/UserContext";
import LoginModal from "./LoginModal";

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useUser();
  const [showLoginModal, setShowLoginModal] = React.useState(!isAuthenticated);

  // 如果用户已认证，关闭登录模态框
  React.useEffect(() => {
    if (isAuthenticated) {
      setShowLoginModal(false);
    } else {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  // 如果用户未认证，显示登录模态框
  if (!isAuthenticated) {
    return (
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          // 不允许关闭登录模态框，除非用户已登录
          if (isAuthenticated) {
            setShowLoginModal(false);
          }
        }}
        forceLogin={true}
      />
    );
  }

  // 用户已认证，显示页面内容
  return children;
};

export default AuthGuard;
