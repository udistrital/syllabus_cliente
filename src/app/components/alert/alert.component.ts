import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  @Input() type: 'success' | 'warning' | 'info';
  @Input() message: string;

  get icon() {
    const icons = {
      success: 'check_circle',
      warning: 'warning',
      info: 'info',
    }
    return icons[this.type];
  }
}
