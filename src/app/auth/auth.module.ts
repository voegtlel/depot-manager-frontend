import {
    NbAuthJWTToken,
    NbAuthModule,
    NbAuthStrategyClass,
    NbPasswordAuthStrategy,
    NbPasswordAuthStrategyOptions,
} from '@nebular/auth';
import { getApiUrl } from '../_services';
import { Injectable, NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    NbAlertModule,
    NbButtonModule,
    NbCheckboxModule,
    NbIconModule,
    NbInputModule,
    NbThemeModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

/**
 * This class overrides the default endpoint handling for a flexible api endpoint.
 */
@Injectable()
export class NbPasswordAuthStrategyEndpoint extends NbPasswordAuthStrategy {
    static setup(options: NbPasswordAuthStrategyOptions): [NbAuthStrategyClass, NbPasswordAuthStrategyOptions] {
        return [NbPasswordAuthStrategyEndpoint, options];
    }

    protected getActionEndpoint(action: string): string {
        const endpoint = super.getActionEndpoint(action);
        if (!endpoint) {
            return endpoint;
        }
        const apiUrl = getApiUrl();
        return apiUrl + endpoint;
    }
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbButtonModule,
        NbThemeModule,
        NbCheckboxModule,
        NbInputModule,
        NbAlertModule,
        NbEvaIconsModule,
        NbIconModule,
        ReactiveFormsModule,
        RouterModule,
        FormsModule,

        NbAuthModule.forRoot({
            strategies: [
                NbPasswordAuthStrategyEndpoint.setup({
                    name: 'email',
                    baseEndpoint: '',
                    refreshToken: {
                        endpoint: '/refresh-token',
                        defaultErrors: ['Username/password combination is not correct, please try again.'],
                        defaultMessages: ['You have been successfully logged in.'],
                        requireValidToken: false,
                    },
                    login: {
                        endpoint: '/jwt-auth',
                        defaultErrors: ['Username/password combination is not correct, please try again.'],
                        defaultMessages: ['You have been successfully logged in.'],
                        requireValidToken: false,
                    },
                    logout: {
                        endpoint: '',
                        defaultErrors: ['Something went wrong, please try again.'],
                        defaultMessages: ['You have been successfully logged out.'],
                    },
                    token: {
                        class: NbAuthJWTToken,
                        key: 'token',
                    },
                    validation: {
                        email: {
                            regexp: '.*',
                        },
                    },
                }),
            ],
            forms: {
                login: {},
                requestPassword: { showMessages: { success: true, error: true } },
                resetPassword: { showMessages: { success: true, error: true } },
                logout: {
                    redirectDelay: 1,
                },
            },
        }),
    ],
    exports: [NbAuthModule],
    declarations: [LoginComponent],
})
export class DepotManAuthModule {}
