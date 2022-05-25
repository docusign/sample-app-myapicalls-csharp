import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.scss'],
})
export class LoginPromptComponent implements OnInit {
  url: string = '/';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.url = this.router.url;
  }
}
