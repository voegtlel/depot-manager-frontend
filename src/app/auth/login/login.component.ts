import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {NB_AUTH_OPTIONS, NbAuthResult, NbAuthService, NbAuthSocialLink, getDeepFromObject} from '@nebular/auth';
import {ActivatedRoute, Router} from '@angular/router';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    redirectDelay = 0;
    showMessages: any = {};
    strategy = '';

    errors: string[] = [];
    messages: string[] = [];
    user: any = {};
    submitted = false;
    socialLinks: NbAuthSocialLink[] = [];
    rememberMe = false;

    returnUrl = '/';

    constructor(protected service: NbAuthService,
                @Inject(NB_AUTH_OPTIONS) protected options = {},
                protected cd: ChangeDetectorRef,
                protected router: Router,
                private route: ActivatedRoute
    ) {

        this.redirectDelay = this.getConfigValue('forms.login.redirectDelay');
        this.showMessages = this.getConfigValue('forms.login.showMessages');
        this.strategy = this.getConfigValue('forms.login.strategy');
        this.socialLinks = this.getConfigValue('forms.login.socialLinks');
        this.rememberMe = this.getConfigValue('forms.login.rememberMe');

        route.queryParams.subscribe(params => {
            if (params.hasOwnProperty('returnUrl')) {
                this.returnUrl = params['returnUrl'];
            }
        });
    }

    login(): void {
        this.errors = this.messages = [];
        this.submitted = true;

        this.service.authenticate(this.strategy, this.user).subscribe((result: NbAuthResult) => {
            this.submitted = false;

            if (result.isSuccess()) {
                this.messages = result.getMessages();

                // const redirect = result.getRedirect();
                const redirect = this.returnUrl;
                if (redirect) {
                    setTimeout(() => {
                        console.log('Login redirect', redirect);
                        return this.router.navigate([redirect]);
                        // return this.router.navigateByUrl(redirect);
                    }, this.redirectDelay);
                }
            } else {
                this.errors = result.getErrors();
            }

            this.cd.detectChanges();
        });
    }

    getConfigValue(key: string): any {
        return getDeepFromObject(this.options, key, null);
    }
}
