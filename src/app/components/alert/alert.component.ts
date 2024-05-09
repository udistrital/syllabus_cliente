import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() type: 'success' | 'warning';
  @Input() message: string;

  get icon() {
    const icons = {
      success: 'check_circle',
      warning: 'warning'
    }
    return icons[this.type];
  }
}
