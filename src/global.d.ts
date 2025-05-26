declare module 'electron-store' {
    interface ElectronStore<T> {
        get<K extends keyof T>(key: K): T[K];
    }
}

declare module 'Components' {
    const components: {
        [key: string]: React.ComponentType<any>;
    };
    export = components;
}

declare module 'Locales' {
    const locales: {
        [key: string]: any;
    };
    export = locales;
}

declare module 'Providers' {
    const providers: {
        [key: string]: React.ComponentType<any>;
    };
    export = providers;
}

declare module 'Routes' {
    const routes: {
        [key: string]: React.ComponentType<any>;
    };
    export = routes;
}

declare module 'Utils' {
    const utils: {
        [key: string]: any;
    };
    export = utils;
}

// Path-based type declarations
declare module '@/*' {
    const content: any;
    export default content;
}

declare module '@Components/*' {
    const content: React.ComponentType<any>;
    export default content;
}

declare module '@Routes/*' {
    const content: React.ComponentType<any>;
    export default content;
}

declare module '@Locales/*' {
    const content: any;
    export default content;
}

declare module '@Providers/*' {
    const content: React.ComponentType<any>;
    export default content;
}

declare module '@Utils/*' {
    const content: any;
    export default content;
}