import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { MovieDto } from '../../../../core/services/movie.service';
import { UserMovieService } from '../../../../core/services/user-movie.service';
import { RatingStarsComponent } from '../../../../shared/ui/rating-stars/rating-stars.component';

@Component({
  selector: 'app-user-movie-add-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RatingStarsComponent],
  templateUrl: './user-movie-add-modal.component.html',
})
export class UserMovieAddModalComponent implements OnChanges {
  @Input({ required: true }) open = false;
  @Input() movie: MovieDto | null = null;

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly submitted = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly userMovieService = inject(UserMovieService);

  readonly reviewControl = new FormControl('', { nonNullable: true });
  readonly submitting = signal(false);
  readonly submissionError = signal<string | null>(null);
  rating = 0;

  protected readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) {
        this.prepareFormState();
      } else {
        this.resetState();
      }
    }

    if (changes['movie'] && this.open) {
      this.prepareFormState();
    }
  }

  requestClose(): void {
    if (this.submitting()) {
      return;
    }

    this.resetState();
    this.closed.emit();
  }

  submit(): void {
    const movie = this.movie;
    const user = this.authService.user();

    if (!movie || typeof movie.id !== 'number') {
      this.submissionError.set('Film introuvable.');
      return;
    }

    if (!user) {
      this.submissionError.set('Veuillez vous connecter pour ajouter un film.');
      return;
    }

    if (this.submitting()) {
      return;
    }

    this.submissionError.set(null);
    this.submitting.set(true);

    const ratingValue = this.rating > 0 ? this.rating : null;
    const reviewValue = this.reviewControl.value.trim();

    this.userMovieService
      .addOrUpdateUserMovie(
        user.id,
        movie.id,
        ratingValue,
        reviewValue.length > 0 ? reviewValue : null,
        user.token,
      )
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.submitted.emit();
          this.resetState();
          this.closed.emit();
        },
        error: (error) => {
          console.error('Failed to add movie for user', error);
          this.submissionError.set(
            "Une erreur est survenue lors de l'ajout du film. Veuillez réessayer.",
          );
        },
      });
  }

  private prepareFormState(): void {
    this.rating = 0;
    this.reviewControl.reset('');

    if (!this.movie || typeof this.movie.id !== 'number') {
      this.submissionError.set('Film introuvable.');
      return;
    }

    if (!this.isAuthenticated()) {
      this.submissionError.set('Vous devez être connecté pour ajouter un film à votre liste.');
      return;
    }

    this.submissionError.set(null);
  }

  private resetState(): void {
    this.rating = 0;
    this.reviewControl.reset('');
    this.submissionError.set(null);
  }
}
