let navigateFunction: (path: string) => void;

export const setNavigate = (fn: (path: string) => void) => {
  navigateFunction = fn;
}

export const navigate = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  }
}
