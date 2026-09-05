import { type ReactNode } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface ContainerProps {
  icon?: ReactNode;
  titleModule: string;
  description?: string;
  titleButton?: string;
  onRetryData?: () => void;
  onClickButton?: () => void;
  children?: ReactNode;
  showButtons?: boolean;
}

const Container = ({
  icon,
  titleModule,
  description,
  titleButton,
  onRetryData,
  onClickButton,
  children,
  showButtons = true,
}: ContainerProps) => {
  return (
    <div className="p-4 space-y-2">
      <div className="w-full flex items-center flex-col sm:flex-row justify-between mb-2 gap-4">
        <div className="flex items-center gap-2">
          {icon}
          <div className="-space-y-2">
            <h1 className="text-lg font-semibold">{titleModule}</h1>
            <span className="text-xs opacity-70">{description}</span>
          </div>
        </div>
        {showButtons && (
          <div className="flex items-center gap-2">
            <Button variant={"outline"} size={"icon"} onClick={onRetryData}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.3rem"
                height="1.3rem"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                >
                  <path
                    strokeMiterlimit="10"
                    d="M18.024 7.043A8.374 8.374 0 0 0 3.74 12.955"
                  />
                  <path
                    strokeLinejoin="round"
                    d="m17.35 2.75l.832 3.372a1.123 1.123 0 0 1-.854 1.382l-3.372.843"
                  />
                  <path
                    strokeMiterlimit="10"
                    d="M5.976 16.957a8.374 8.374 0 0 0 14.285-5.912"
                  />
                  <path
                    strokeLinejoin="round"
                    d="m6.65 21.25l-.832-3.372a1.124 1.124 0 0 1 .855-1.382l3.371-.843"
                  />
                </g>
              </svg>
            </Button>
            <Button onClick={onClickButton}>
              <Plus size={18} />
              {titleButton}
            </Button>
          </div>
        )}
      </div>
      <div className="h-[calc(100vh-10.5rem)] overflow-y-auto remove-scroll">
        {children}
      </div>
    </div>
  );
};

export default Container;
