import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Route } from '../../../constant/route.constant';
import { DialogComponent } from '../../../module/dialog/dialog.component';
import { AuthService } from '../../../services/google/auth.service';
import { AppGlobals } from '../../../services/google/oauth2.global';
import { Communication } from '../../../util/communication.util';
import { Log } from '../../../util/log.util';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  communication: Communication;

  private subscription: any;

  constructor(private _googleAuth: AuthService,
              private _http: HttpClient,
              private dialog: MatDialog,
              private activatedRoute: ActivatedRoute) {
    this.communication = new Communication(_http);
  }

  ngOnInit(): void {
    AppGlobals.GOOGLE_CLIENT_ID = '1088081523392-gq9s5uqj1v7mb4eipq6ni7mh6hmsnfk1.apps.googleusercontent.com';

    this.subscribeToRouter();
  }

  ngAfterViewInit(): void {
    this.authenticateUserWithGoogle();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  subscribeToRouter(): void {
    this.subscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      const error = params[Route.PARAM_ERROR];
      if (error) {
        this.openErrorDialog();
      }
    });
  }

  openErrorDialog(): void {
    this.dialog.open(DialogComponent, {
      data: {
        title: 'DIALOG_LOGIN_ERROR.TITLE',
        content: 'DIALOG_LOGIN_ERROR.CONTENT',
        content_param: null,
        actionButtons: {
          negativeTextReference: null,
          positiveTextReference: 'DIALOG_DEFAULT.OK'
        }
      }
    });
  }

  authenticateUserWithGoogle(): void {
    this._googleAuth.authenticateUser((name, email) => {
      this.isUserAuthorized(name, email);
    });
  }

  isUserAuthorized(name: string, email: string): void {
    const user = this.getNewUser(name, email);
    const route = Route.API_USER_AUTHORIZE_VERIFY;
    const body = user;

    this.communication.post(route, body, (success, message, data) => {
      if (!success) {
        Log.error('Error logging into the platform.');

        return this.changeUrlToLoginError();
      }

      this._googleAuth.storeUserInformation(() => {
        this.changeUrlToApplication();
      });
    });
  }

  getNewUser(name: string, email: string): User {
    const user = new User();
    user.name = name;
    user.setEmail(email);
    return user;
  }

  changeUrlToApplication(): void {
    window.location.href = Route.CLUSTERS;
  }

  changeUrlToLoginError(): void {
    window.location.href = Route.LOGIN_ERROR;
  }

  getLoginButtonId(): string {
    return AuthService.BUTTON_LOGIN_ID;
  }
}
