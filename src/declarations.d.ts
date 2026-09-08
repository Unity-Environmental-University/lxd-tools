declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare global {
  interface Global {
    TextEncoder: typeof TextEncoder;
  }
}

declare module "*.html" {
  const content: string;
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
