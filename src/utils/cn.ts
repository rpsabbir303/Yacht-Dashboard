import classNames, { type Argument } from "classnames";

export const cn = (...inputs: Argument[]): string => classNames(...inputs);
