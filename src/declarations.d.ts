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
