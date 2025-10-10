import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent {
  readonly isAuthenticated = input(false);
  readonly user = input<AuthUser | null>(null);

  readonly openLogin = output<void>();
  readonly openRegister = output<void>();
  readonly logout = output<void>();

  readonly username = computed(() => this.user()?.username ?? '');
}
