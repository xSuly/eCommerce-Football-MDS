import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthentificated: boolean = false;
  userFullName: string = '';
  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  ngOnInit(): void {

    // Subscribe to authentification state changes
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthentificated = result.isAuthenticated!;
        this.getUserDetails();
      }
    );
  }

  getUserDetails() {
    if (this.isAuthentificated) {

      // Fetch the logged in user details 

      // user full name is exposed as a property name
      this.oktaAuth.getUser().then(
        (res)  => {
          this.userFullName = res.name as string;

          // retrieve the user's email 
          const theEmail = res.email;

          // store the email in browser session storage
          this.storage.setItem('userEmail', JSON.stringify(theEmail));
        }
      );
    }
  }

  logout() {
    // Terminates the session with Okta and removes current tokens.
    this.oktaAuth.signOut();
  }
}
