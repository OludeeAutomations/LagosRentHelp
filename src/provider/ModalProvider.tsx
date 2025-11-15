// providers/ModalProvider.tsx
import { LoginModal } from "@/components/common/LoginModal";

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <LoginModal />
    </>
  );
};
