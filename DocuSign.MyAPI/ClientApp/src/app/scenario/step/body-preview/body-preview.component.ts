import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-body-preview',
  templateUrl: './body-preview.component.html',
  styleUrls: ['./body-preview.component.scss'],
})
export class BodyPreviewComponent {
  @Input() body: string = '';
  @Input() title: string = '';
  @Input() label: string = '';
  isPanelOpened = true;

  constructor() {}
}
