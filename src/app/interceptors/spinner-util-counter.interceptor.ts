import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { SpinnerUtilService } from 'spinner-util';

@Injectable()
export class SpinnerUtilCounterInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private visible = false;

  constructor(private spinnerService: SpinnerUtilService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.activeRequests += 1;
    if (this.activeRequests === 1 && !this.visible) {
      this.visible = true;
      this.spinnerService.show();
    }

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        if (this.activeRequests === 0 && this.visible) {
          this.visible = false;
          this.spinnerService.hide();
        }
      })
    );
  }
}
