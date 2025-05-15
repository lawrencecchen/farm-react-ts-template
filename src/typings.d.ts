declare module '*.svg';
declare module '*.png';
declare module '*.css';

 interface ImportMeta {
  loadManaComponent: (componentPath: string) => Promise<React.ComponentType>;
}
