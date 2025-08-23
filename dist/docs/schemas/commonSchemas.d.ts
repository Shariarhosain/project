export declare const commonSchemas: {
    Error: {
        type: string;
        required: string[];
        properties: {
            error: {
                type: string;
                description: string;
                example: string;
            };
            message: {
                type: string;
                description: string;
                example: string;
            };
            details: {
                type: string;
                description: string;
                example: {
                    field: string;
                    code: string;
                };
            };
        };
    };
    ValidationError: {
        type: string;
        required: string[];
        properties: {
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
        };
    };
    SuccessMessage: {
        type: string;
        properties: {
            message: {
                type: string;
                example: string;
            };
        };
    };
    Pagination: {
        type: string;
        required: string[];
        properties: {
            page: {
                type: string;
                minimum: number;
                example: number;
            };
            limit: {
                type: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            total: {
                type: string;
                minimum: number;
                example: number;
            };
            totalPages: {
                type: string;
                minimum: number;
                example: number;
            };
        };
    };
};
//# sourceMappingURL=commonSchemas.d.ts.map