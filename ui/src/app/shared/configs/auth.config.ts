import { NbAuthJWTToken, NbPasswordAuthStrategy } from '@nebular/auth';
import { environment } from 'src/environments/environment';

export const authConfig = {
    strategies: [
        NbPasswordAuthStrategy.setup({
            name: 'email',
            token: {
                class: NbAuthJWTToken,
                key: 'token',
            },
            baseEndpoint: environment.apiEndpoint,
            login: {
                endpoint: '/auth/login',
                redirect: {
                    success: '/pages/chat',
                    failure: null, // stay on the same page
                },
            },
            register: {
                endpoint: '/auth/register',
            },
        }),
    ],
    forms: {},
};

