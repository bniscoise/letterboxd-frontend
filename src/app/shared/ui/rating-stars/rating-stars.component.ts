import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarIconComponent } from '../star-icon/star-icon.component';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule, StarIconComponent],
  templateUrl: 'rating-stars.component.html',
  styleUrl: 'rating-stars.component.css',
})
export class RatingStarsComponent {
  private static readonly STEP = 0.5;
  private static readonly MAX = 5;

  protected readonly stars = [0, 1, 2, 3, 4];

  private _rating = 0;
  hoverRating: number | null = null;

  @Input() set rating(value: number | null | undefined) {
    this._rating = this.normalize(value ?? 0);
  }

  get rating(): number {
    return this._rating;
  }

  @Input() size = 32;
  @Input() readonly = false;
  @Input() activeColor = '#FEEC40';
  @Input() inactiveColor = '#D1D5DB';
  @Input() strokeColor = '#BEA62D';

  @Output() readonly ratingChange = new EventEmitter<number>();

  get displayRating(): number {
    return this.hoverRating ?? this._rating;
  }

  fillFor(index: number): number {
    const delta = this.displayRating - index;
    return Math.max(0, Math.min(1, delta));
  }

  preview(value: number): void {
    if (this.readonly) {
      return;
    }

    this.hoverRating = this.normalize(value);
  }

  clearPreview(): void {
    this.hoverRating = null;
  }

  select(value: number): void {
    if (this.readonly) {
      return;
    }

    const normalized = this.normalize(value);
    const next = this._rating === normalized ? 0 : normalized;
    this._rating = next;
    this.hoverRating = null;
    this.ratingChange.emit(next);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private normalize(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const clamped = Math.min(RatingStarsComponent.MAX, Math.max(0, value));
    const rounded = Math.round(clamped / RatingStarsComponent.STEP) * RatingStarsComponent.STEP;
    return Math.round(rounded * 100) / 100;
  }
}
