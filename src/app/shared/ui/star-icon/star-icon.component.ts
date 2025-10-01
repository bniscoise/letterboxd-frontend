import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

let uniqueId = 0;

@Component({
  selector: 'app-star-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-icon.component.html',
  styleUrl: './star-icon.component.css'
})
export class StarIconComponent {
  private static readonly VIEW_BOX_WIDTH = 423.938;
  private static readonly VIEW_BOX_HEIGHT = 403.2;

  @Input() size = 32;
  @Input() fill = 1;
  @Input() activeColor = '#FEEC40';
  @Input() inactiveColor = '#D1D5DB';
  @Input() strokeColor = '#BEA62D';

  readonly gradientId = `starIconGradient${uniqueId++}`;

  get widthPx(): number {
    return Math.max(this.size, 0);
  }

  get heightPx(): number {
    return this.widthPx * (StarIconComponent.VIEW_BOX_HEIGHT / StarIconComponent.VIEW_BOX_WIDTH);
  }

  get fillPercent(): number {
    const clamped = Math.max(0, Math.min(this.fill ?? 0, 1));
    return Math.round(clamped * 10000) / 100;
  }
}
