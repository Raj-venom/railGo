export interface SignUpBody {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export type OtpSessionMeta = {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
};
