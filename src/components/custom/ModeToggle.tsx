import { Button } from "../ui/button";
import { useTheme } from "./Theme-provider";
import { IconSun, IconMoon } from "@tabler/icons-react";

const ModeToggle = () => {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? (
        <IconSun
          stroke={2}
          className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all"
        />
      ) : (
        <IconMoon
          stroke={2}
          className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all"
        />
      )}
    </Button>
  );
};

export default ModeToggle;
