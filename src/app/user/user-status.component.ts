import { Component, Input } from '@angular/core';
import { FirebaseUserModel } from '../core/user.model';
import { UserService } from '../core/user.service';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'user-container',
  templateUrl: 'user-status.component.html',
  styles: [`
  .light {
    color:#ddd;
  }
  .circle {
    font-size:40px
  }
  .user{
    display:inline-block;
    color: #444;
  }
  .name{
    font-size:15px;
    height:25px;
    margin:0px;
    color: #444;
  }
  .a:hover {
    text-decoration: none;
    color: #444;
  }
  .email{
    font-size:10px;
    height:15px;
    margin-top:-10px;
  }
  .opensans {
    font-family: "Open Sans", sans-serif
  }
    `]
})
export class UserContainer {

  // Testing

  private isLoggedIn: Boolean;
  private displayName: String;
  private email: String;


  // End Testing

  user: FirebaseUserModel = new FirebaseUserModel();

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private route: ActivatedRoute,

    // Testing
    private router: Router
    // End Testing
  ) {

    this.authService.afAuth.authState.subscribe(
      (auth) => {
        if (auth == null) {
          console.log("Logged out");
          this.isLoggedIn = false;
          this.displayName = '';
          this.email = '';
          if (this.router.url === "/register") {

          } else {
            this.router.navigate(['/login']);
          }
        } else {
          this.isLoggedIn = true;
          this.displayName = auth.displayName;
          this.email = auth.email;
          console.log("Logged in");
          this.router.navigate(['planner']);
        }
      }
    );
  }

}
