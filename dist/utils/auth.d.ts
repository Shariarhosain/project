export declare const generateGuestToken: () => string;
export declare const generateJWT: (payload: {
    id: string;
    email: string;
    name: string;
    role: string;
}) => string;
export declare const verifyJWT: (token: string) => any;
export declare const extractGuestToken: (authHeader?: string) => string | null;
export declare const extractUserToken: (authHeader?: string) => string | null;
//# sourceMappingURL=auth.d.ts.map