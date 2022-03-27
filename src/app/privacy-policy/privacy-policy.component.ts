import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service'
import { Router, Params } from '@angular/router';

@Component({
  selector: 'privacy-policy',
  templateUrl: 'privacy-policy.component.html',
  styleUrls: ['privacy-policy.component.scss']
})
export class PrivacyContainer {

  constructor(
    private router: Router,
  ) {}

}