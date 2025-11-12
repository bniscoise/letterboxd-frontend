import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthModalService } from '../../core/services/auth-modal.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  private readonly authModal = inject(AuthModalService);

  openLogin(): void {
    this.authModal.openLogin();
  }

  openRegister(): void {
    this.authModal.openRegister();
  }
}
